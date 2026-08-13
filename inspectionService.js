import { supabase } from './supabaseClient.js';

export const inspectionService = {
    /**
     * Creates a new inspection record for a vehicle UUID.
     * Enforces strict mandatory mileage validation (no default 0 fallbacks).
     */
    async createInspection(vehicleId, inspectionData = {}) {
        if (!vehicleId) {
            throw new Error('Vehicle ID is required.');
        }

        const mileage = inspectionData.mileage !== undefined && inspectionData.mileage !== null && inspectionData.mileage !== ''
            ? parseInt(inspectionData.mileage, 10)
            : null;

        if (mileage === null || isNaN(mileage)) {
            throw new Error('Mileage at inspection is mandatory and cannot be left blank or zero if unrecorded.');
        }

        const payload = {
            ...inspectionData,
            vehicle_id: vehicleId,
            inspection_status: 'PENDING',
            inspection_number: inspectionData.inspection_number || `INSP-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            inspection_date: inspectionData.inspection_date || new Date().toISOString().split('T')[0],
            mileage: mileage
        };

        const { data, error } = await supabase
            .from('inspections')
            .insert([payload])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    /**
     * Updates an existing inspection record.
     */
    async updateInspection(inspectionId, updateData) {
        const { data, error } = await supabase
            .from('inspections')
            .update({
                ...updateData,
                updated_at: new Date().toISOString()
            })
            .eq('id', inspectionId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    /**
     * Adds an inspection finding to a specific area.
     */
    async addInspectionFinding(inspectionId, findingData) {
        const rating = findingData.rating || 'PASS';

        if (
            rating !== 'PASS' &&
            (
                !findingData.finding?.trim() ||
                !findingData.significance?.trim() ||
                !findingData.recommended_action?.trim()
            )
        ) {
            throw new Error('ATTENTION and FAIL require a finding, significance, and recommended action.');
        }

        const payload = {
            inspection_id: inspectionId,
            area: findingData.area,
            component: findingData.component?.trim() || 'General',
            rating: rating,
            severity: findingData.severity !== undefined ? parseInt(findingData.severity, 10) : 1,
            finding: findingData.finding?.trim() || 'No faults observed',
            significance: findingData.significance?.trim() || 'N/A',
            recommended_action: findingData.recommended_action?.trim() || 'None',
            estimated_cost: findingData.estimated_cost !== undefined && findingData.estimated_cost !== null && findingData.estimated_cost !== ''
                ? parseFloat(findingData.estimated_cost)
                : null,
            is_safety_critical: findingData.is_safety_critical || false
        };

        const { data, error } = await supabase
            .from('inspection_findings')
            .insert([payload])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    /**
     * Clears existing findings for an inspection and cleans up associated Storage photos to prevent orphans.
     */
    async clearInspectionFindings(inspectionId) {
        // 1. Fetch existing findings and their photos
        const { data: findings, error: fetchError } = await supabase
            .from('inspection_findings')
            .select('id, finding_photos(storage_path)')
            .eq('inspection_id', inspectionId);

        if (fetchError) throw new Error(fetchError.message);

        if (findings && findings.length > 0) {
            const storagePathsToRemove = [];
            findings.forEach(f => {
                if (f.finding_photos && f.finding_photos.length > 0) {
                    f.finding_photos.forEach(p => {
                        if (p.storage_path) storagePathsToRemove.push(p.storage_path);
                    });
                }
            });

            // 2. Remove physical files from Supabase Storage bucket
            if (storagePathsToRemove.length > 0) {
                await supabase.storage
                    .from('vehicle-photos')
                    .remove(storagePathsToRemove);
            }

            // 3. Delete finding records (Cascade deletes finding_photos rows)
            const findingIds = findings.map(f => f.id);
            const { error: deleteError } = await supabase
                .from('inspection_findings')
                .delete()
                .in('id', findingIds);

            if (deleteError) throw new Error(deleteError.message);
        }
    },

    /**
     * Uploads evidence photo for a finding to Supabase Storage and creates finding_photos record.
     */
    async uploadFindingPhoto(findingId, file, options = {}) {
        if (!file || !(file instanceof File)) {
            throw new Error('A valid file is required.');
        }

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
                caption: options.caption || null,
                sort_order: options.sort_order !== undefined ? parseInt(options.sort_order, 10) : 0
            }])
            .select()
            .single();

        if (error) {
            await supabase.storage
                .from('vehicle-photos')
                .remove([fileName]);

            throw new Error(error.message);
        }

        return data;
    },

    /**
     * Uploads the official inspection report document PDF.
     */
    async uploadInspectionReport(inspectionId, file) {
        if (!file || !(file instanceof File)) {
            throw new Error('A valid file is required.');
        }

        if (file.type !== 'application/pdf') {
            throw new Error('Inspection report must be a PDF.');
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `reports/${inspectionId}/official_report.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('vehicle-photos')
            .upload(fileName, file, { upsert: true });

        if (uploadError) throw new Error(uploadError.message);

        const { data: { publicUrl } } = supabase.storage
            .from('vehicle-photos')
            .getPublicUrl(fileName);

        const { data, error } = await supabase
            .from('inspections')
            .update({ report_path: publicUrl, updated_at: new Date().toISOString() })
            .eq('id', inspectionId)
            .select()
            .single();

        if (error) {
            await supabase.storage
                .from('vehicle-photos')
                .remove([fileName]);

            throw new Error(error.message);
        }

        return data;
    },

    /**
     * Marks an inspection as COMPLETED with whitelisting on scores and conclusion fields.
     */
    async completeInspection(inspectionId, finalScoresAndSummary) {
        const allowedFields = [
            'overall_score',
            'mechanical_score',
            'electrical_score',
            'body_score',
            'interior_score',
            'suspension_score',
            'brake_score',
            'diagnostic_score',
            'road_test_score',
            'overall_condition',
            'recommendation',
            'summary'
        ];

        const cleanPayload = {};
        for (const field of allowedFields) {
            if (finalScoresAndSummary[field] !== undefined) {
                cleanPayload[field] = finalScoresAndSummary[field];
            }
        }

        const { data, error } = await supabase
            .from('inspections')
            .update({
                ...cleanPayload,
                inspection_status: 'COMPLETED',
                completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', inspectionId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    /**
     * Fetches inspection details along with findings and finding photos.
     */
    async getInspectionDetails(inspectionId) {
        const { data: inspection, error: inspError } = await supabase
            .from('inspections')
            .select('*, inspection_findings(*, finding_photos(*))')
            .eq('id', inspectionId)
            .single();

        if (inspError) throw new Error(inspError.message);
        return inspection;
    }
};

export const createInspection = inspectionService.createInspection;
export const updateInspection = inspectionService.updateInspection;
export const addInspectionFinding = inspectionService.addInspectionFinding;
export const clearInspectionFindings = inspectionService.clearInspectionFindings;
export const uploadFindingPhoto = inspectionService.uploadFindingPhoto;
export const uploadInspectionReport = inspectionService.uploadInspectionReport;
export const completeInspection = inspectionService.completeInspection;
export const getInspectionDetails = inspectionService.getInspectionDetails;
