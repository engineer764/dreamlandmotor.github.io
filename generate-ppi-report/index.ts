import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PYTHON_REPORT_SERVICE_URL =
  Deno.env.get("PYTHON_REPORT_SERVICE_URL") ?? "";

const SERVICE_SECRET =
  Deno.env.get("PYTHON_SERVICE_SECRET") ?? "";

serve(async (req) => {
  try {
    // --------------------------------------------------
    // 1. Validate configuration
    // --------------------------------------------------
    if (!PYTHON_REPORT_SERVICE_URL || !SERVICE_SECRET) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Report service configuration is missing. Set PYTHON_REPORT_SERVICE_URL and PYTHON_SERVICE_SECRET.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // --------------------------------------------------
    // 2. Validate authenticated user
    // --------------------------------------------------
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing authorization header",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    const {
      data: { user },
      error: userErr,
    } = await supabaseClient.auth.getUser();

    if (userErr || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized user session",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // --------------------------------------------------
    // 3. Validate administrator role
    // --------------------------------------------------
    const { data: staff, error: roleErr } = await supabaseClient
      .from("users")
      .select("role, active")
      .eq("id", user.id)
      .single();

    if (
      roleErr ||
      !staff?.active ||
      !["ADMIN", "SUPER_ADMIN"].includes(staff.role)
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Access Denied: Administrative privileges required",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // --------------------------------------------------
    // 4. Read request
    // --------------------------------------------------
    const { inspectionId } = await req.json();

    if (!inspectionId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Inspection ID is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // --------------------------------------------------
    // 5. Service-role client
    // --------------------------------------------------
    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // --------------------------------------------------
    // 6. Fetch authoritative inspection data
    // --------------------------------------------------
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
      return new Response(
        JSON.stringify({
          success: false,
          error: "Inspection record not found",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // --------------------------------------------------
    // 7. Report can only be generated after approval
    // --------------------------------------------------
    if (inspection.inspection_status !== "APPROVED") {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Inspection status must be APPROVED (current: ${inspection.inspection_status})`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // --------------------------------------------------
    // 8. Fetch vehicle
    // --------------------------------------------------
    let vehicle = null;
    const signedPhotoUrls: string[] = [];

    if (inspection.vehicle_id) {
      const { data: vehicleData } = await adminSupabase
        .from("vehicles")
        .select("*")
        .eq("id", inspection.vehicle_id)
        .maybeSingle();

      vehicle = vehicleData;

      // ------------------------------------------------
      // 9. Create temporary signed vehicle photo URLs
      // ------------------------------------------------
      const { data: photoData } = await adminSupabase
        .from("vehicle_photos")
        .select("storage_path, public_url")
        .eq("vehicle_id", inspection.vehicle_id);

      for (const photo of photoData ?? []) {
        let path = photo.storage_path;

        if (!path && photo.public_url) {
          const marker =
            "/storage/v1/object/public/vehicle-photos/";

          const markerIndex = photo.public_url.indexOf(marker);

          if (markerIndex !== -1) {
            path = photo.public_url.substring(
              markerIndex + marker.length
            );
          }
        }

        if (!path) continue;

        const { data: signedData } =
          await adminSupabase.storage
            .from("vehicle-photos")
            .createSignedUrl(path, 300);

        if (signedData?.signedUrl) {
          signedPhotoUrls.push(signedData.signedUrl);
        }
      }
    }

    // --------------------------------------------------
    // 10. Fetch linked PPI request
    // --------------------------------------------------
    let ppiRequest = null;

    if (inspection.ppi_request_id) {
      const { data: ppiData } = await adminSupabase
        .from("ppi_requests")
        .select("*")
        .eq("id", inspection.ppi_request_id)
        .maybeSingle();

      ppiRequest = ppiData;
    }

    // --------------------------------------------------
    // 11. Build authoritative report payload
    // --------------------------------------------------
    const reportPayload = {
      inspectionNumber: inspection.inspection_number,

      ppiNumber:
        ppiRequest?.ppi_number || "DL-PPI-DIRECT",

      vehicle: vehicle || {},

      items: inspection.inspection_items || [],

      findings: inspection.inspection_findings || [],

      hasScannerReport:
        !!inspection.scanner_report_path,

      photos: signedPhotoUrls,

      signoff: {
        inspectorId: inspection.inspector_id,

        approvedBy: inspection.approved_by,

        approvedAt: inspection.approved_at,

        reportGeneratedBy:
          user.email || user.id,

        reportGeneratedAt:
          new Date().toISOString(),
      },
    };

    // --------------------------------------------------
    // 12. Call Python ReportLab service
    // --------------------------------------------------
    const pyResponse = await fetch(
      PYTHON_REPORT_SERVICE_URL,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "X-Service-Secret": SERVICE_SECRET,
        },

        body: JSON.stringify(reportPayload),
      }
    );

    if (!pyResponse.ok) {
      const pythonError =
        await pyResponse.text().catch(() => "");

      throw new Error(
        `Python ReportLab service failed (HTTP ${pyResponse.status})${
          pythonError
            ? `: ${pythonError}`
            : ""
        }`
      );
    }

    const pdfBuffer =
      await pyResponse.arrayBuffer();

    // --------------------------------------------------
    // 13. Determine storage path
    // --------------------------------------------------
    const ppiNumber =
      ppiRequest?.ppi_number ||
      "DL-PPI-DIRECT";

    const year =
      new Date().getFullYear();

    const storagePath =
      `ppi/${year}/${ppiNumber}/${ppiNumber}_Official_Report.pdf`;

    // --------------------------------------------------
    // 14. Upload official PDF
    // --------------------------------------------------
    const { error: uploadErr } =
      await adminSupabase.storage
        .from("inspection-reports")
        .upload(
          storagePath,
          pdfBuffer,
          {
            upsert: true,
            contentType: "application/pdf",
          }
        );

    if (uploadErr) {
      throw new Error(
        `Failed to upload official report: ${uploadErr.message}`
      );
    }

    // --------------------------------------------------
    // 15. APPROVED → REPORT_GENERATED
    // --------------------------------------------------
    const generationTimestamp =
      new Date().toISOString();

    const { data: updateData, error: updateErr } =
      await adminSupabase
        .from("inspections")
        .update({
          report_path: storagePath,

          report_generated_by: user.id,

          report_generated_at:
            generationTimestamp,

          inspection_status:
            "REPORT_GENERATED",

          updated_at:
            generationTimestamp,
        })
        .eq("id", inspectionId)
        .eq("inspection_status", "APPROVED")
        .select()
        .single();

    if (updateErr || !updateData) {
      throw new Error(
        "Failed to transition inspection state. The inspection may have been modified concurrently."
      );
    }

    // --------------------------------------------------
    // 16. Success
    // --------------------------------------------------
    return new Response(
      JSON.stringify({
        success: true,
        reportPath: storagePath,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err: any) {
    console.error(
      "generate-ppi-report error:",
      err
    );

    return new Response(
      JSON.stringify({
        success: false,
        error:
          err?.message ||
          "Report generation failed.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
});
