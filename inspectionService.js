// inspectionService.js
import { supabase } from './supabaseClient.js';
import { MASTER_CHECKLIST } from './masterChecklist.js';

export const inspectionService = {
    async getInspectionById(inspectionId) {
        if (!inspectionId) throw new Error('Inspection ID is required.');

        const { data: inspection, error: inspectionError } = await supabase
            .from('inspections')
            .select(`
                *,
                inspection_items (*),
                inspection_findings (*)
            `)
            .eq('id', inspectionId)
            .single();

        if (inspectionError) throw inspectionError;

        let vehicle = null;
        if (inspection.vehicle_id) {
            const { data: vehicleData, error: vehicleError } = await supabase
                .from('vehicles')
                .select('id, make, model, year, trim, vin, registration_number, location, mileage')
                .eq('id', inspection.vehicle_id)
                .maybeSingle();

            if (vehicleError) throw vehicleError;
            vehicle = vehicleData;
        }

        return { ...inspection, vehicles: vehicle };
    },

    async getInspectionForVehicle(vehicleId) {
        if (!vehicleId) throw new Error('Vehicle ID is required.');

        const { data: vehicle, error: vehicleError } = await supabase
            .from('vehicles')
            .select('verification_inspection_id')
            .eq('id', vehicleId)
            .single();

        if (vehicleError) throw vehicleError;

        let inspectionId = vehicle?.verification_inspection_id;
        if (!inspectionId) {
            const { data: inspections, error: inspError } = await supabase
                .from('inspections')
                .select('id')
                .eq('vehicle_id', vehicleId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (inspError) throw inspError;
            if (inspections && inspections.length > 0) inspectionId = inspections[0].id;
        }

        if (!inspectionId) return null;
        return await this.getInspectionById(inspectionId);
    },

    async startNewInspection({ vehicleId = null, ppiRequestId = null, inspectorId = null, inspectionType = 'TECHNICAL_PPI', inspectionOrigin = 'CUSTOMER_PPI', mileage = 0 }) {
        const checklistPayload = MASTER_CHECKLIST.map((item, index) => ({
            section: item.section || item.category || 'GENERAL',
            item_code: item.item_code || item.code || `ITM-${String(index + 1).padStart(4, '0')}`,
            item_name: item.item_name || item.name || 'Inspection Item',
            is_applicable: item.default_applicable !== false,
            sort_order: index
        }));

        const { data, error } = await supabase.rpc('create_inspection_with_checklist', {
            p_vehicle_id: vehicleId,
            p_ppi_request_id: ppiRequestId,
            p_inspector_id: inspectorId,
            p_inspection_type: inspectionType,
            p_inspection_origin: inspectionOrigin,
            p_mileage: mileage || 0,
            p_checklist_items: checklistPayload
        });

        if (error) throw error;
        return await this.getInspectionById(data.id);
    },

    async getOrCreateVerifiedVehicleInspection({ vehicleId, inspectorId = null, inspectionType = 'TECHNICAL_PPI', mileage = 0 }) {
        if (!vehicleId) throw new Error('Vehicle ID is required.');

        const checklistPayload = MASTER_CHECKLIST.map((item, index) => ({
            section: item.section || item.category || 'GENERAL',
            item_code: item.item_code || item.code || `ITM-${String(index + 1).padStart(4, '0')}`,
            item_name: item.item_name || item.name || 'Inspection Item',
            is_applicable: item.default_applicable !== false,
            sort_order: index
        }));

        const { data, error } = await supabase.rpc('get_or_create_verified_vehicle_inspection', {
            p_vehicle_id: vehicleId,
            p_inspector_id: inspectorId,
            p_inspection_type: inspectionType,
            p_mileage: mileage || 0,
            p_checklist_items: checklistPayload
        });

        if (error) throw error;
        if (!data?.id) throw new Error('The inspection could not be initialized.');

        return await this.getInspectionById(data.id);
    },

    async startOrResumeInspection(inspectionId) {
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) throw new Error('Authentication required.');

        const { data: inspection, error: fetchError } = await supabase
            .from('inspections')
            .select('id, inspector_id, inspection_status')
            .eq('id', inspectionId)
            .single();

        if (fetchError) throw fetchError;
        if (inspection.inspector_id !== user.id) throw new Error('Access Denied: You are not assigned to this inspection.');

        if (!['ASSIGNED', 'CHANGES_REQUESTED'].includes(inspection.inspection_status)) return inspection;

        const { error } = await supabase
            .from('inspections')
            .update({
                inspection_status: 'IN_PROGRESS',
                started_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', inspectionId)
            .eq('inspector_id', user.id);

        if (error) throw error;
        return this.getInspectionById(inspectionId);
    },

    async updateInspectionItem(itemId, updateData) {
        const { error } = await supabase
            .from('inspection_items')
            .update({ ...updateData, updated_at: new Date().toISOString() })
            .eq('id', itemId);

        if (error) throw error;
        return true;
    },

    async addInspectionFinding(inspectionId, findingData) {
        let rawRating = (findingData.rating || findingData.severity || 'FAIR').toUpperCase();
        let severity = parseInt(findingData.severity_level || findingData.severity) || 2;
        let rating = 'FAIR';

        if (rawRating === 'NOTE') { rating = 'FAIR'; severity = 1; }
        else if (rawRating === 'MINOR') { rating = 'FAIR'; severity = 2; }
        else if (rawRating === 'MODERATE') { rating = 'ATTENTION'; severity = 3; }
        else if (rawRating === 'MAJOR') { rating = 'ATTENTION'; severity = 4; }
        else if (rawRating === 'CRITICAL') { rating = 'CRITICAL'; severity = 5; }

        const payload = {
            inspection_id: inspectionId,
            area: findingData.area || findingData.section || 'General',
            component: findingData.component || findingData.item_name || 'General Component',
            rating: rating,
            severity: severity,
            finding: findingData.finding || findingData.description || '',
            significance: findingData.significance || '',
            recommended_action: findingData.recommended_action || findingData.recommendation || '',
            estimated_cost: parseFloat(findingData.estimated_cost) || 0,
            is_safety_critical: findingData.is_safety_critical || rating === 'CRITICAL' || severity >= 4
        };

        const { data, error } = await supabase
            .from('inspection_findings')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteInspectionFinding(findingId) {
        const { error } = await supabase.from('inspection_findings').delete().eq('id', findingId);
        if (error) throw error;
        return true;
    },

    async completeInspection(inspectionId) {
        if (!inspectionId) throw new Error('Inspection ID is required.');

        const { error } = await supabase.rpc('complete_inspection', {
            p_inspection_id: inspectionId
        });

        if (error) throw error;
        return true;
    },

    async submitInspectionForReview(inspectionId) {
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) throw new Error('Authentication required.');

        const { data: inspection, error: inspErr } = await supabase
            .from('inspections')
            .select('id, inspector_id, inspection_status')
            .eq('id', inspectionId)
            .single();

        if (inspErr || !inspection) throw new Error('Inspection record not found.');
        if (inspection.inspector_id !== user.id) throw new Error('Access Denied: You are not assigned as the inspector.');

        const allowedStates = ['ASSIGNED', 'IN_PROGRESS', 'CHANGES_REQUESTED'];
        if (!allowedStates.includes(inspection.inspection_status)) {
            throw new Error(`Cannot submit inspection from state: ${inspection.inspection_status}`);
        }

        const { data: items, error: itemsErr } = await supabase
            .from('inspection_items')
            .select('status, is_applicable')
            .eq('inspection_id', inspectionId);

        if (itemsErr) throw itemsErr;

        const unassessed = items.filter(i => i.is_applicable && (i.status === 'PENDING' || !i.status));
        if (unassessed.length > 0) {
            throw new Error(`Cannot submit inspection: ${unassessed.length} required checklist items remain unassessed.`);
        }

        const { error: updateErr } = await supabase
            .from('inspections')
            .update({
                inspection_status: 'SUBMITTED_FOR_REVIEW',
                submitted_by: user.id,
                submitted_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', inspectionId);

        if (updateErr) throw updateErr;
        return true;
    },

    async requestInspectionChanges(inspectionId, reviewNotes) {
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) throw new Error('Authentication required.');

        const { data: adminUser, error: roleErr } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (roleErr || !['ADMIN', 'SUPER_ADMIN'].includes(adminUser?.role)) {
            throw new Error('Access Denied: Administrative privileges required.');
        }

        const { error } = await supabase
            .from('inspections')
            .update({
                inspection_status: 'CHANGES_REQUESTED',
                changes_requested_by: user.id,
                changes_requested_at: new Date().toISOString(),
                review_notes: reviewNotes,
                updated_at: new Date().toISOString()
            })
            .eq('id', inspectionId);

        if (error) throw error;
        return true;
    },

    async approveInspection(inspectionId) {
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) throw new Error('Authentication required.');

        const { data: adminUser, error: roleErr } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (roleErr || !['ADMIN', 'SUPER_ADMIN'].includes(adminUser?.role)) {
            throw new Error('Access Denied: Administrative privileges required.');
        }

        const { error } = await supabase
            .from('inspections')
            .update({
                inspection_status: 'APPROVED',
                approved_by: user.id,
                approved_at: new Date().toISOString(),
                reviewer_id: user.id,
                reviewed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', inspectionId);

        if (error) throw error;
        return true;
    },

    async uploadScannerPdf(inspectionId, file) {
        if (!inspectionId) throw new Error('Inspection ID is required.');
        if (!file || file.type !== 'application/pdf') {
            throw new Error('Only valid PDF files are accepted for scanner reports.');
        }
        if (file.size > 15 * 1024 * 1024) {
            throw new Error('File size exceeds the 15 MB limit.');
        }

        const filePath = `inspections/${inspectionId}/scanner_${Date.now()}.pdf`;
        const { error: uploadError } = await supabase.storage
            .from('vehicle-photos')
            .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
            .from('vehicle-photos')
            .getPublicUrl(filePath);

        const { error: updateError } = await supabase
            .from('inspections')
            .update({ scanner_report_path: publicUrlData.publicUrl, updated_at: new Date().toISOString() })
            .eq('id', inspectionId);

        if (updateError) {
            await supabase.storage.from('vehicle-photos').remove([filePath]).catch((cleanupErr) => {
                console.error('Failed to cleanup orphaned scanner PDF:', cleanupErr);
            });
            throw updateError;
        }

        return await this.getInspectionById(inspectionId);
    },

    async uploadOfflineReport(inspectionId, file) {
        if (!inspectionId) throw new Error('Inspection ID is required.');
        if (!file || file.type !== 'application/pdf') {
            throw new Error('Only valid PDF files are accepted for offline reports.');
        }
        if (file.size > 15 * 1024 * 1024) {
            throw new Error('File size exceeds the 15 MB limit.');
        }

        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) throw new Error('Authentication required.');

        const { data: inspection, error: fetchErr } = await supabase
            .from('inspections')
            .select('id, inspector_id, inspection_status, offline_report_path')
            .eq('id', inspectionId)
            .single();

        if (fetchErr || !inspection) throw new Error('Inspection record not found.');

        const { data: staffUser } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(staffUser?.role);
        const isAssignedInspector = inspection.inspector_id === user.id;

        if (!isAdmin && !isAssignedInspector) {
            throw new Error('Access Denied: You are not authorized to upload a report for this inspection.');
        }

        if (!isAdmin) {
            const allowedStatuses = ['ASSIGNED', 'IN_PROGRESS', 'CHANGES_REQUESTED'];
            if (!allowedStatuses.includes(inspection.inspection_status)) {
                throw new Error(`Cannot upload offline report while inspection is in '${inspection.inspection_status}' status.`);
            }
        }

        const filePath = `offline-inspections/${inspectionId}/offline_${Date.now()}.pdf`;
        const { error: uploadError } = await supabase.storage
            .from('inspection-reports')
            .upload(filePath, file, { upsert: false });

        if (uploadError) throw uploadError;

        const { data: updatedRows, error: updateError } = await supabase
            .from('inspections')
            .update({
                offline_report_path: filePath,
                offline_report_uploaded_at: new Date().toISOString(),
                offline_report_uploaded_by: user.id,
                updated_at: new Date().toISOString()
            })
            .eq('id', inspectionId)
            .select();

        if (updateError || !updatedRows || updatedRows.length === 0) {
            await supabase.storage.from('inspection-reports').remove([filePath]).catch((cleanupErr) => {
                console.error('Failed to cleanup orphaned offline report after DB error:', cleanupErr);
            });
            throw new Error(updateError?.message || 'Database update failed; uploaded file was rolled back.');
        }

        if (isAdmin && inspection?.offline_report_path && inspection.offline_report_path !== filePath) {
            await supabase.storage.from('inspection-reports').remove([inspection.offline_report_path]).catch((cleanupErr) => {
                console.error('Non-critical error cleaning up previous offline report:', cleanupErr);
            });
        }

        return await this.getInspectionById(inspectionId);
    },

    async getOfflineReportSignedUrl(inspectionId) {
        if (!inspectionId) throw new Error('Inspection ID is required.');

        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) throw new Error('Authentication required.');

        const { data: inspection, error: fetchErr } = await supabase
            .from('inspections')
            .select('id, inspector_id, reviewer_id, offline_report_path')
            .eq('id', inspectionId)
            .single();

        if (fetchErr || !inspection || !inspection.offline_report_path) {
            throw new Error('No offline report found for this inspection.');
        }

        const { data: staffUser } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(staffUser?.role);
        const isAuthorized = inspection.inspector_id === user.id || inspection.reviewer_id === user.id;

        if (!isAdmin && !isAuthorized) {
            throw new Error('Access Denied: You are not authorized to view this offline report.');
        }

        const { data, error } = await supabase.storage
            .from('inspection-reports')
            .createSignedUrl(inspection.offline_report_path, 300); // 5 minutes

        if (error) throw error;
        if (!data?.signedUrl) throw new Error('Failed to generate secure signed URL.');

        return data.signedUrl;
    }
};
