import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PYTHON_REPORT_SERVICE_URL = Deno.env.get("PYTHON_REPORT_SERVICE_URL") || "https://your-python-service.onrender.com/generate";
const SERVICE_SECRET = Deno.env.get("PYTHON_SERVICE_SECRET") || "";

serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: "Missing authorization header" }), { status: 401 });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userErr } = await supabaseClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized user session" }), { status: 401 });
    }

    const { data: staff, error: roleErr } = await supabaseClient
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (roleErr || !["ADMIN", "SUPER_ADMIN"].includes(staff?.role)) {
      return new Response(JSON.stringify({ success: false, error: "Access Denied: Administrative privileges required" }), { status: 403 });
    }

    const { inspectionId } = await req.json();
    if (!inspectionId) {
      return new Response(JSON.stringify({ success: false, error: "Inspection ID is required" }), { status: 400 });
    }

    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Fetch authoritative inspection records
    const { data: inspection, error: inspErr } = await adminSupabase
      .from("inspections")
      .select(`
        *,
        inspection_items (*),
        inspection_findings (*)
      `)
      .eq("id", inspectionId)
      .single();

    if (inspErr || !inspection) {
      return new Response(JSON.stringify({ success: false, error: "Inspection record not found" }), { status: 404 });
    }

    if (inspection.inspection_status !== "APPROVED") {
      return new Response(JSON.stringify({ success: false, error: `Inspection status must be APPROVED (current: ${inspection.inspection_status})` }), { status: 400 });
    }

    let vehicle = null;
    let signedPhotoUrls: string[] = [];

    if (inspection.vehicle_id) {
      const { data: vData } = await adminSupabase.from("vehicles").select("*").eq("id", inspection.vehicle_id).maybeSingle();
      vehicle = vData;

      const { data: pData } = await adminSupabase.from("vehicle_photos").select("storage_path, public_url").eq("vehicle_id", inspection.vehicle_id);
      if (pData) {
        for (const photo of pData) {
          const path = photo.storage_path || photo.public_url.split("/storage/v1/object/public/vehicle-photos/")[1];
          if (path) {
            const { data: signedData } = await adminSupabase.storage
              .from("vehicle-photos")
              .createSignedUrl(path, 300); // 5 min signed URL for Python renderer
            if (signedData?.signedUrl) {
              signedPhotoUrls.push(signedData.signedUrl);
            }
          }
        }
      }
    }

    let ppiRequest = null;
    if (inspection.ppi_request_id) {
      const { data: pData } = await adminSupabase.from("ppi_requests").select("*").eq("id", inspection.ppi_request_id).maybeSingle();
      ppiRequest = pData;
    }

    const reportPayload = {
      inspectionNumber: inspection.inspection_number,
      ppiNumber: ppiRequest?.ppi_number || "DL-PPI-DIRECT",
      vehicle: vehicle || {},
      items: inspection.inspection_items || [],
      findings: inspection.inspection_findings || [],
      hasScannerReport: !!inspection.scanner_report_path,
      photos: signedPhotoUrls,
      signoff: {
        inspectorId: inspection.inspector_id,
        approvedBy: inspection.approved_by,
        approvedAt: inspection.approved_at,
        reportGeneratedBy: user.email || user.id,
        reportGeneratedAt: new Date().toISOString()
      }
    };

    // 2. Invoke Python ReportLab Service with X-Service-Secret
    const pyResponse = await fetch(PYTHON_REPORT_SERVICE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Service-Secret": SERVICE_SECRET
      },
      body: JSON.stringify(reportPayload)
    });

    if (!pyResponse.ok) {
      throw new Error("Python ReportLab PDF rendering service failed.");
    }

    const pdfBuffer = await pyResponse.arrayBuffer();

    // 3. Upload to dedicated 'inspection-reports' bucket
    const ppiNum = ppiRequest?.ppi_number || "DL-PPI-DIRECT";
    const year = new Date().getFullYear();
    const storagePath = `ppi/${year}/${ppiNum}/${ppiNum}_Official_Report.pdf`;

    const { error: uploadErr } = await adminSupabase.storage
      .from("inspection-reports")
      .upload(storagePath, pdfBuffer, { upsert: true, contentType: "application/pdf" });

    if (uploadErr) throw uploadErr;

    // 4. Conditional State Transition: APPROVED -> REPORT_GENERATED
    const generationTimestamp = new Date().toISOString();
    const { data: updateData, error: updateErr } = await adminSupabase
      .from("inspections")
      .update({
        report_path: storagePath,
        report_generated_by: user.id,
        report_generated_at: generationTimestamp,
        inspection_status: "REPORT_GENERATED",
        updated_at: generationTimestamp
      })
      .eq("id", inspectionId)
      .eq("inspection_status", "APPROVED") // State Guard
      .select()
      .single();

    if (updateErr || !updateData) {
      throw new Error("Failed to transition inspection state or state modified concurrently.");
    }

    return new Response(JSON.stringify({ success: true, reportPath: storagePath }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
});
