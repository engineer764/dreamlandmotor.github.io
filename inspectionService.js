import { supabase } from './supabaseClient.js';
import { inspectionScoring } from './inspectionScoring.js';

export const inspectionService = {
    async getInspectionsForVehicle(vehicleId) {
        if (!vehicleId) throw new Error('Vehicle ID is required.');
        const { data, error } = await supabase
            .from('inspections')
            .select(`*, inspection_findings (*, finding_photos (*))`)
            .eq('vehicle_id', vehicleId)
            .order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        return data || [];
    },

    async getInspectionById(inspectionId) {
        if (!inspectionId) throw new Error('Inspection ID is required.');
        const { data, error } = await supabase
            .from('inspections')
            .select(`*, inspection_findings (*, finding_photos (*))`)
            .eq('id', inspectionId)
            .single();
        if (error) throw new Error(error.message);
        return data;
    },

    async getInspectionDetails(inspectionId) {
        return this.getInspectionById(inspectionId);
    },

    async createInspection(vehicleId, initialData = {}) {
        if (!vehicleId) throw new Error('Vehicle ID is required.');

        const { data: existingList, error: fetchError } = await supabase
            .from('inspections')
            .select(`*, inspection_findings (*, finding_photos (*))`)
            .eq('vehicle_id', vehicleId)
            .in('inspection_status', ['DRAFT', 'IN_PROGRESS'])
            .order('created_at', { ascending: false })
            .limit(1);

        if (fetchError) throw new Error(fetchError.message);
        if (existingList && existingList.length > 0) return existingList[0];

        const { data: vehicle, error: vError } = await supabase
            .from('vehicles')
            .select('mileage')
            .eq('id', vehicleId)
            .single();

        if (vError) throw new Error('Vehicle not found for inspection initialization.');

        const inspectionNumber = `INS-${Math.floor(100000 + Math.random() * 900000)}`;
        const payload = {
            vehicle_id: vehicleId,
            inspector_id: initialData.inspector_id || null,
            inspection_number: inspectionNumber,
            inspection_date: new Date().toISOString().split('T')[0],
            mileage: initialData.mileage !== undefined ? parseInt(initialData.mileage, 10) : (vehicle?.mileage || 0),
            inspection_status: 'DRAFT',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const { data: newInsp, error: createError } = await supabase
            .from('inspections')
            .insert([payload])
            .select(`*, inspection_findings (*, finding_photos (*))`)
            .single();

        if (createError) throw new Error(createError.message);
        return newInsp;
    },

    async updateInspectionDetails(inspectionId, updates) {
        if (!inspectionId) throw new Error('Inspection ID is required.');
        const payload = { ...updates, updated_at: new Date().toISOString() };
        const { data, error } = await supabase
            .from('inspections')
            .update(payload)
            .eq('id', inspectionId)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data;
    },

    async addInspectionFinding(inspectionId, findingData) {
        if (!inspectionId) {
            throw new Error('Inspection ID is required.');
        }

        const allowedRatings = ['GOOD', 'FAIR', 'ATTENTION', 'CRITICAL'];
        const rating = String(findingData.rating || 'GOOD').toUpperCase();

        if (!allowedRatings.includes(rating)) {
            throw new Error(`Invalid finding rating: ${rating}. Allowed values: GOOD, FAIR, ATTENTION, CRITICAL.`);
        }

        const severity = Number(findingData.severity);

        if (!Number.isInteger(severity) || severity < 1 || severity > 5) {
            throw new Error('Severity must be an integer from 1 to 5.');
        }

        const payload = {
            inspection_id: inspectionId,
            area: findingData.area,
            component: findingData.component?.trim() || null,
            rating: rating,
            severity: severity,
            finding: findingData.finding?.trim() || '',
            significance: findingData.significance?.trim() || null,
            recommended_action: findingData.recommended_action?.trim() || null,
            estimated_cost:
                findingData.estimated_cost !== undefined &&
                findingData.estimated_cost !== null &&
                findingData.estimated_cost !== ''
                    ? Number(findingData.estimated_cost)
                    : null,
            is_safety_critical: Boolean(findingData.is_safety_critical)
        };

        // Move DRAFT → IN_PROGRESS when the first finding is saved
        await supabase
            .from('inspections')
            .update({
                inspection_status: 'IN_PROGRESS',
                updated_at: new Date().toISOString()
            })
            .eq('id', inspectionId)
            .eq('inspection_status', 'DRAFT');

        let result;

        if (findingData.id) {
            const { data, error } = await supabase
                .from('inspection_findings')
                .update(payload)
                .eq('id', findingData.id)
                .select(`*, finding_photos (*)`)
                .single();
            if (error) throw new Error(error.message);
            result = data;
        } else {
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

    async saveFinding(inspectionId, findingData) {
        return this.addInspectionFinding(inspectionId, findingData);
    },

    async deleteInspectionFinding(findingId) {
        if (!findingId) throw new Error('Finding ID is required.');
        const { error } = await supabase.from('inspection_findings').delete().eq('id', findingId);
        if (error) throw new Error(error.message);
        return true;
    },

    async deleteFinding(findingId) {
        return this.deleteInspectionFinding(findingId);
    },

    async uploadFindingPhoto(findingId, file, caption = null) {
        if (!findingId || !file) throw new Error('Finding ID and file are required.');
        const fileExt = file.name.split('.').pop();
        const fileName = `findings/${findingId}/${Math.random().toString(36).substring(2, 10)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage.from('vehicle-photos').upload(fileName, file);
        if (uploadError) throw new Error(uploadError.message);

        const { data: { publicUrl } } = supabase.storage.from('vehicle-photos').getPublicUrl(fileName);
        const { data, error } = await supabase
            .from('finding_photos')
            .insert([{ finding_id: findingId, storage_path: fileName, public_url: publicUrl, caption }])
            .select()
            .single();

        if (error) {
            await supabase.storage.from('vehicle-photos').remove([fileName]);
            throw new Error(error.message);
        }
        return data;
    },

    async deleteFindingPhoto(photoId) {
        const { data: photo, error: fetchErr } = await supabase.from('finding_photos').select('*').eq('id', photoId).single();
        if (fetchErr || !photo) throw new Error('Photo not found.');
        if (photo.storage_path) await supabase.storage.from('vehicle-photos').remove([photo.storage_path]);
        
        const { error } = await supabase.from('finding_photos').delete().eq('id', photoId);
        if (error) throw new Error(error.message);
        return true;
    },

    async completeInspection(inspectionId, finalData = {}) {
        if (!inspectionId) throw new Error('Inspection ID is required.');

        const inspection = await this.getInspectionById(inspectionId);
        const findings = inspection.inspection_findings || [];
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
            .select(`*, inspection_findings (*, finding_photos (*))`)
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    async cancelInspection(inspectionId) {
        if (!inspectionId) throw new Error('Inspection ID is required.');
        const { data, error } = await supabase
            .from('inspections')
            .update({ inspection_status: 'CANCELLED', updated_at: new Date().toISOString() })
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
    getInspectionDetails,
    createInspection,
    updateInspectionDetails,
    addInspectionFinding,
    saveFinding,
    deleteInspectionFinding,
    deleteFinding,
    uploadFindingPhoto,
    deleteFindingPhoto,
    completeInspection,
    cancelInspection
} = inspectionService;
