import { supabase } from './supabaseClient.js';
import { MASTER_CHECKLIST } from './masterChecklist.js';

export const inspectionService = {
    /**
     * Retrieve an inspection directly by its UUID (Supports independent customer PPIs where vehicle_id may be null).
     */
    async getInspectionById(inspectionId) {
        if (!inspectionId) throw new Error('Inspection ID is required.');

        const { data: inspection, error } = await supabase
            .from('inspections')
            .select(`
                *,
                vehicles (id, make, model, year, trim, vin, registration_number, location, mileage),
                inspection_items (*),
                inspection_findings (*)
            `)
            .eq('id', inspectionId)
            .single();

        if (error) throw error;
        return inspection;
    },

    /**
     * Retrieve inspection for a Dreamland Verified vehicle (preserves verification_inspection_id pointer logic).
     */
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
            if (inspections && inspections.length > 0) {
                inspectionId = inspections[0].id;
            }
        }

        if (!inspectionId) return null;
        return await this.getInspectionById(inspectionId);
    },

    /**
     * Start a new inspection (Admin / Authorized creation path with MASTER_CHECKLIST instantiation).
     */
    async startNewInspection({ vehicleId = null, ppiRequestId = null, inspectorId = null, inspectionType = 'TECHNICAL_PPI', mileage = 0 }) {
        const inspectionNumber = `INS-${Date.now().toString().slice(-6)}`;

        const payload = {
            vehicle_id: vehicleId,
            ppi_request_id: ppiRequestId,
            inspector_id: inspectorId,
            inspection_number: inspectionNumber,
            inspection_type: inspectionType,
            inspection_status: 'ASSIGNED',
            inspection_date: new Date().toISOString().split('T')[0],
            mileage: mileage || 0
        };

        const { data: newInspection, error: inspError } = await supabase
            .from('inspections')
            .insert([payload])
            .select()
            .single();

        if (inspError) throw inspError;

        // Instantiate 660-point Master Checklist using exact schema columns
        const checklistItemsPayload = MASTER_CHECKLIST.map((item, index) => ({
            inspection_id: newInspection.id,
            section: item.section || item.category || 'GENERAL',
            item_code: item.code || `ITM-${String(index + 1).padStart(4, '0')}`,
            item_name: item.name || item.item_name || 'Inspection Item',
            status: 'PENDING',
            is_applicable: item.default_applicable !== false,
            sort_order: index
        }));

        const { error: itemsError } = await supabase
            .from('inspection_items')
            .insert(checklistItemsPayload);

        if (itemsError) throw itemsError;

        return await this.getInspectionById(newInspection.id);
    },

    /**
     * Update an individual inspection checklist item.
     */
    async updateInspectionItem(itemId, updateData) {
        const { error } = await supabase
            .from('inspection_items')
            .update({
                ...updateData,
                updated_at: new Date().toISOString()
            })
            .eq('id', itemId);

        if (error) throw error;
        return true;
    },

    /**
     * Add an inspection finding using the exact existing database schema columns.
     */
    async addInspectionFinding(inspectionId, findingData) {
        let rawRating = (findingData.rating || findingData.severity || 'FAIR').toUpperCase();
        let severity = parseInt(findingData.severity_level || findingData.severity) || 2;
        let rating = 'FAIR';

        if (rawRating === 'NOTE') {
            rating = 'FAIR';
            severity = 1;
        } else if (rawRating === 'MINOR') {
            rating = 'FAIR';
            severity = 2;
        } else if (rawRating === 'MODERATE') {
            rating = 'ATTENTION';
            severity = 3;
        } else if (rawRating === 'MAJOR') {
            rating = 'ATTENTION';
            severity = 4;
        } else if (rawRating === 'CRITICAL') {
            rating = 'CRITICAL';
            severity = 5;
        }

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

    /**
     * Delete an inspection finding.
     */
    async deleteInspectionFinding(findingId) {
        const { error } = await supabase
            .from('inspection_findings')
            .delete()
            .eq('id', findingId);

        if (error) throw error;
        return true;
    },

    /**
     * Submit inspection for review using secure server-derived auth session (Inspector workflow).
     */
    async submitInspectionForReview(inspectionId) {
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) throw new Error('Authentication required to submit inspection.');

        const { data: inspection, error: inspErr } = await supabase
            .from('inspections')
            .select('id, inspector_id, inspection_status')
            .eq('id', inspectionId)
            .single();

        if (inspErr || !inspection) throw new Error('Inspection record not found.');

        if (inspection.inspector_id !== user.id) {
            throw new Error('Access Denied: You are not assigned as the inspector for this record.');
        }

        const allowedStates = ['ASSIGNED', 'IN_PROGRESS', 'CHANGES_REQUESTED'];
        if (!allowedStates.includes(inspection.inspection_status)) {
            throw new Error(`Cannot submit inspection from current state: ${inspection.inspection_status}`);
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

    /**
     * Upload scanner PDF report using inspection-based storage path and existing scanner_report_path column.
     */
    async uploadScannerPdf(inspectionId, file) {
        const filePath = `inspections/${inspectionId}/scanner_${Date.now()}.pdf`;
        const { error: uploadError } = await supabase.storage
            .from('vehicle-photos')
            .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
            .from('vehicle-photos')
            .getPublicUrl(filePath);

        const publicUrl = publicUrlData.publicUrl;

        const { error: updateError } = await supabase
            .from('inspections')
            .update({ scanner_report_path: publicUrl, updated_at: new Date().toISOString() })
            .eq('id', inspectionId);

        if (updateError) throw updateError;
        return publicUrl;
    },

    /**
     * Securely start or resume an assigned inspection (ASSIGNED or CHANGES_REQUESTED -> IN_PROGRESS).
     */
    async startOrResumeInspection(inspectionId) {
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) throw new Error('Authentication required.');

        const { data: inspection, error: fetchError } = await supabase
            .from('inspections')
            .select('id, inspector_id, inspection_status')
            .eq('id', inspectionId)
            .single();

        if (fetchError) throw fetchError;

        if (inspection.inspector_id !== user.id) {
            throw new Error('Access Denied: You are not assigned to this inspection.');
        }

        if (!['ASSIGNED', 'CHANGES_REQUESTED'].includes(inspection.inspection_status)) {
            return inspection;
        }

        const { data, error } = await supabase
            .from('inspections')
            .update({
                inspection_status: 'IN_PROGRESS',
                updated_at: new Date().toISOString()
            })
            .eq('id', inspectionId)
            .eq('inspector_id', user.id)
            .in('inspection_status', ['ASSIGNED', 'CHANGES_REQUESTED'])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};import { supabase } from './supabaseClient.js';
import { MASTER_CHECKLIST } from './masterChecklist.js';

export const inspectionService = {
    async getInspectionById(inspectionId) {
        if (!inspectionId) throw new Error('Inspection ID is required.');

        const { data: inspection, error } = await supabase
            .from('inspections')
            .select(`
                *,
                vehicles (id, make, model, year, trim, vin, registration_number, location, mileage),
                inspection_items (*),
                inspection_findings (*)
            `)
            .eq('id', inspectionId)
            .single();

        if (error) throw error;
        return inspection;
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
            if (inspections && inspections.length > 0) {
                inspectionId = inspections[0].id;
            }
        }

        if (!inspectionId) return null;
        return await this.getInspectionById(inspectionId);
    },

    async startNewInspection({ vehicleId = null, ppiRequestId = null, inspectorId = null, inspectionType = 'TECHNICAL_PPI', mileage = 0 }) {
        const inspectionNumber = `INS-${Date.now().toString().slice(-6)}`;

        const payload = {
            vehicle_id: vehicleId,
            ppi_request_id: ppiRequestId,
            inspector_id: inspectorId,
            inspection_number: inspectionNumber,
            inspection_type: inspectionType,
            inspection_status: 'ASSIGNED',
            inspection_date: new Date().toISOString().split('T')[0],
            mileage: mileage || 0
        };

        const { data: newInspection, error: inspError } = await supabase
            .from('inspections')
            .insert([payload])
            .select()
            .single();

        if (inspError) throw inspError;

        // Instantiate 660-point Master Checklist using exact schema columns
        const checklistItemsPayload = MASTER_CHECKLIST.map((item, index) => ({
            inspection_id: newInspection.id,
            section: item.section || item.category || 'GENERAL',
            item_code: item.code || `ITM-${String(index + 1).padStart(4, '0')}`,
            item_name: item.name || item.item_name || 'Inspection Item',
            status: 'PENDING',
            is_applicable: item.default_applicable !== false,
            sort_order: index
        }));

        const { error: itemsError } = await supabase
            .from('inspection_items')
            .insert(checklistItemsPayload);

        if (itemsError) throw itemsError;

        return await this.getInspectionById(newInspection.id);
    },

    async updateInspectionItem(itemId, updateData) {
        const { error } = await supabase
            .from('inspection_items')
            .update({
                ...updateData,
                updated_at: new Date().toISOString()
            })
            .eq('id', itemId);

        if (error) throw error;
        return true;
    },

    async addInspectionFinding(inspectionId, findingData) {
        let rawRating = (findingData.rating || findingData.severity || 'FAIR').toUpperCase();
        let severity = parseInt(findingData.severity_level || findingData.severity) || 2;
        let rating = 'FAIR';

        if (rawRating === 'NOTE') {
            rating = 'FAIR';
            severity = 1;
        } else if (rawRating === 'MINOR') {
            rating = 'FAIR';
            severity = 2;
        } else if (rawRating === 'MODERATE') {
            rating = 'ATTENTION';
            severity = 3;
        } else if (rawRating === 'MAJOR') {
            rating = 'ATTENTION';
            severity = 4;
        } else if (rawRating === 'CRITICAL') {
            rating = 'CRITICAL';
            severity = 5;
        }

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
        const { error } = await supabase
            .from('inspection_findings')
            .delete()
            .eq('id', findingId);

        if (error) throw error;
        return true;
    },

    async submitInspectionForReview(inspectionId) {
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) throw new Error('Authentication required to submit inspection.');

        const { data: inspection, error: inspErr } = await supabase
            .from('inspections')
            .select('id, inspector_id, inspection_status')
            .eq('id', inspectionId)
            .single();

        if (inspErr || !inspection) throw new Error('Inspection record not found.');

        if (inspection.inspector_id !== user.id) {
            throw new Error('Access Denied: You are not assigned as the inspector for this record.');
        }

        const allowedStates = ['ASSIGNED', 'IN_PROGRESS', 'CHANGES_REQUESTED'];
        if (!allowedStates.includes(inspection.inspection_status)) {
            throw new Error(`Cannot submit inspection from current state: ${inspection.inspection_status}`);
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

    async uploadScannerPdf(inspectionId, file) {
        const filePath = `inspections/${inspectionId}/scanner_${Date.now()}.pdf`;
        const { error: uploadError } = await supabase.storage
            .from('vehicle-photos')
            .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
            .from('vehicle-photos')
            .getPublicUrl(filePath);

        const publicUrl = publicUrlData.publicUrl;

        const { error: updateError } = await supabase
            .from('inspections')
            .update({ scanner_report_path: publicUrl, updated_at: new Date().toISOString() })
            .eq('id', inspectionId);

        if (updateError) throw updateError;
        return publicUrl;
    }
};
