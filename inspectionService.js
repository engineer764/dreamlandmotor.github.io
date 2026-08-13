import { supabase } from './supabaseClient.js';
import { inspectionScoring } from './inspectionScoring.js';

export const inspectionService = {
    /**
     * Fetches all inspections for a specific vehicle.
     */
    async getInspectionsForVehicle(vehicleId) {
        if (!vehicleId) throw new Error('Vehicle ID is required.');

        const { data, error } = await supabase
            .from('inspections')
            .select(`
                *,
                inspection_findings (
                    *,
                    finding_photos (*)
                )
            `)
            .eq('vehicle_id', vehicleId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data || [];
    },

    /**
     * Fetches a single inspection by its ID, including findings and photos.
     */
    async getInspectionById(inspectionId) {
        if (!inspectionId) throw new Error('Inspection ID is required.');

        const { data, error } = await supabase
            .from('inspections')
            .select(`
                *,
                inspection_findings (
                    *,
                    finding_photos (*)
                )
            `)
            .eq('id', inspectionId)
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    /**
     * Gets the latest active or completed inspection for a vehicle, 
     * or creates a new DRAFT inspection if none exists.
     */
    async getOrCreateActiveInspection(vehicleId, inspectorId = null) {
        if (!vehicleId) throw new Error('Vehicle ID is required.');

        // 1. Check for existing DRAFT or IN_PROGRESS inspection
        const { data: existingList, error: fetchError } = await supabase
            .from('inspections')
            .select(`
                *,
                inspection_findings (
                    *,
                    finding_photos (*)
                )
            `)
            .eq('vehicle_id', vehicleId)
            .in('inspection_status', ['DRAFT', 'IN_PROGRESS'])
            .order('created_at', { ascending: false })
            .limit(1);

        if (fetchError) throw new Error(fetchError.message);

        if (existingList && existingList.length > 0) {
            return existingList[0];
        }

        // 2. Fetch vehicle mileage to prefill inspection mileage
        const { data: vehicle, error: vError } = await supabase
            .from('vehicles')
            .select('mileage')
            .eq('id', vehicleId)
            .single();

        if (vError) throw new Error('Vehicle not found for inspection initialization.');

        // 3. Create new DRAFT inspection
        const inspectionNumber = `INS-${Math.floor(100000 + Math.random() * 900000)}`;
        const payload = {
            vehicle_id: vehicleId,
            inspector_id: inspectorId,
            inspection_number: inspectionNumber,
            inspection_date: new Date().toISOString().split('T')[0],
            mileage: vehicle?.mileage || 0,
            inspection_status: 'DRAFT',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const { data: newInsp, error: createError } = await supabase
            .from('inspections')
            .insert([payload])
            .select(`
                *,
                inspection_findings (
                    *,
                    finding_photos (*)
                )
            `)
            .single();

        if (createError) throw new Error(createError.message);
        return newInsp;
    },

    /**
     * Updates general inspection metadata (mileage, dates, inspector).
     */
    async updateInspectionDetails(inspectionId, updates) {
        if (!inspectionId) throw new Error('Inspection ID is required.');

        // If updating notes/details and currently DRAFT, bump to IN_PROGRESS
        const payload = {
            ...updates,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('inspections')
            .update(payload)
            .eq('id', inspectionId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    /**
     * Adds or updates an inspection finding.
     */
    async saveFinding(inspectionId, findingData) {
        if (!inspectionId) throw new Error('Inspection ID is required.');

        // Ensure status is at least IN_PROGRESS when findings are recorded
        await supabase
            .from('inspections')
            .update({ inspection_status: 'IN_PROGRESS', updated_at: new Date().toISOString() })
            .eq('id', inspectionId)
            .eq('inspection_status', 'DRAFT');

        const payload = {
            inspection_id: inspectionId,
            area: findingData.area,
            component: findingData.component || null,
            rating: findingData.rating || 'PASS', // PASS, ATTENTION, FAIL, SEVERE
            severity: findingData.severity !== undefined ? parseInt(findingData.severity, 10) : 1,
            finding: findingData.finding || '',
            significance: findingData.significance || null,
            recommended_action: findingData.recommended_action || null,
            estimated_cost: findingData.estimated_cost ? parseFloat(findingData.estimated_cost) : 0,
            is_safety_critical: findingData.is_safety_critical || false
        };

        let result;
        if (findingData.id) {
            // Update existing finding
            const { data, error } = await supabase
                .from('inspection_findings')
                .update(payload)
                .eq('id', findingData.id)
                .select(`*, finding_photos (*)`)
                .single();

            if (error) throw new Error(error.message);
            result = data;
        } else {
            // Insert new finding
            const { data, error } = await supabase
                .from('inspection_findings')
                .insert([payload])
                .select(`*, finding_photos (*)`)
                .single();

            if (error) throw new Error(error.message);
            result = data;
        }

        return result;
    },

    /**
     * Deletes an inspection finding.
     */
    async deleteFinding(findingId) {
        if (!findingId) throw new Error('Finding ID is required.');

        const { error } = await supabase
            .from('inspection_findings')
            .delete()
            .eq('id', findingId);

        if (error) throw new Error(error.message);
        return true;
    },

    /**
     * Uploads an evidence photo for a finding.
     */
    async uploadFindingPhoto(findingId, file, caption = null) {
        if (!findingId || !file) throw new Error('Finding ID and file are required.');

        const fileExt = file.name.split('.').pop();
        const fileName = `findings/${findingId}/${Math.random().toString(36).substring(2, 10)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('vehicle-photos')
            .upload(fileName, file);

        if (uploadError) throw new Error(uploadError.message);

        const { data: { publicUrl } } = supabase.storage
            .from('vehicle-photos')
            .getPublicUrl(fileName);

        const { data, error } = await supabase
            .from('finding_photos')
            .insert([{
                finding_id: findingId,
                storage_path: fileName,
                public_url: publicUrl,
                caption: caption
            }])
            .select()
            .single();

        if (error) {
            await supabase.storage.from('vehicle-photos').remove([fileName]);
            throw new Error(error.message);
        }

        return data;
    },

    /**
     * Deletes an evidence photo.
     */
    async deleteFindingPhoto(photoId) {
        const { data: photo, error: fetchErr } = await supabase
            .from('finding_photos')
            .select('*')
            .eq('id', photoId)
            .single();

        if (fetchErr || !photo) throw new Error('Photo not found.');

        if (photo.storage_path) {
            await supabase.storage.from('vehicle-photos').remove([photo.storage_path]);
        }

        const { error } = await supabase
            .from('finding_photos')
            .delete()
            .eq('id', photoId);

        if (error) throw new Error(error.message);
        return true;
    },

    /**
     * Finalizes and completes the inspection, calculating scores and setting status to COMPLETED.
     */
    async completeInspection(inspectionId, finalData = {}) {
        if (!inspectionId) throw new Error('Inspection ID is required.');

        // 1. Fetch full inspection with findings to compute scores
        const inspection = await this.getInspectionById(inspectionId);
        const findings = inspection.inspection_findings || [];

        // 2. Compute scores using inspectionScoring
        const computedScores = inspectionScoring.calculateScores(findings);

        const payload = {
            overall_score: computedScores.overall_score,
            mechanical_score: computedScores.mechanical_score,
            electrical_score: computedScores.electrical_score,
            body_score: computedScores.body_score,
            interior_score: computedScores.interior_score,
            suspension_score: computedScores.suspension_score,
            brake_score: computedScores.brake_score,
            diagnostic_score: computedScores.diagnostic_score,
            road_test_score: computedScores.road_test_score,
            overall_condition: finalData.overall_condition || computedScores.overall_condition,
            recommendation: finalData.recommendation || computedScores.recommendation,
            summary: finalData.summary || computedScores.summary,
            inspection_status: 'COMPLETED',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('inspections')
            .update(payload)
            .eq('id', inspectionId)
            .select(`
                *,
                inspection_findings (
                    *,
                    finding_photos (*)
                )
            `)
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    /**
     * Cancels an inspection.
     */
    async cancelInspection(inspectionId) {
        if (!inspectionId) throw new Error('Inspection ID is required.');

        const { data, error } = await supabase
            .from('inspections')
            .update({
                inspection_status: 'CANCELLED',
                updated_at: new Date().toISOString()
            })
            .eq('id', inspectionId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }
};

export const {
    getInspectionsForVehicle,
    getInspectionById,
    getOrCreateActiveInspection,
    updateInspectionDetails,
    saveFinding,
    deleteFinding,
    uploadFindingPhoto,
    deleteFindingPhoto,
    completeInspection,
    cancelInspection
} = inspectionService;
