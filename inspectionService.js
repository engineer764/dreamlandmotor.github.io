import { supabase } from './supabaseClient.js';
import { MASTER_CHECKLIST } from './masterChecklist.js';
import { inspectionScoring } from './inspectionScoring.js';

export const inspectionService = {
    /**
     * Retrieves an inspection record for a given vehicle using the authoritative 
     * verification_inspection_id relationship when available.
     */
    async getInspectionForVehicle(vehicleId) {
        if (!vehicleId) throw new Error('Vehicle ID is required.');

        // 1. Retrieve verification_inspection_id from the vehicle record
        const { data: vehicle, error: vehicleErr } = await supabase
            .from('vehicles')
            .select('verification_inspection_id')
            .eq('id', vehicleId)
            .single();

        if (vehicleErr) {
            throw new Error(`Failed to fetch vehicle inspection reference: ${vehicleErr.message}`);
        }

        const inspectionId = vehicle?.verification_inspection_id;

        if (inspectionId) {
            // Retrieve that exact inspection by its ID
            const { data, error } = await supabase
                .from('inspections')
                .select(`
                    *,
                    inspection_items(*),
                    findings:inspection_findings(
                        *,
                        photos:finding_photos(*)
                    )
                `)
                .eq('id', inspectionId)
                .single();

            if (error) throw new Error(error.message);
            return data;
        }

        // If verification_inspection_id is NULL: fallback compatibility check
        const { data: inspections, error: inspErr } = await supabase
            .from('inspections')
            .select(`
                *,
                inspection_items(*),
                findings:inspection_findings(
                    *,
                    photos:finding_photos(*)
                )
            `)
            .eq('vehicle_id', vehicleId);

        if (inspErr) throw new Error(inspErr.message);

        if (!inspections || inspections.length === 0) {
            return null;
        }

        if (inspections.length === 1) {
            return inspections[0];
        }

        // Multiple inspections exist without an authoritative pointer; do not guess.
        throw new Error('Multiple inspection records exist for this vehicle, but no authoritative verification_inspection_id is assigned.');
    },

    /**
     * Starts a new inspection for a vehicle explicitly.
     * Never creates a second inspection when an authoritative or existing inspection already exists.
     */
    async startNewInspection(vehicleId) {
        if (!vehicleId) throw new Error('Vehicle ID is required.');

        const existing = await this.getInspectionForVehicle(vehicleId).catch(() => null);
        if (existing) {
            return existing;
        }

        // Double check any existing inspections by vehicle_id to prevent duplicate creation
        const { data: rawInspections, error: rawErr } = await supabase
            .from('inspections')
            .select('id')
            .eq('vehicle_id', vehicleId);

        if (!rawErr && rawInspections && rawInspections.length > 0) {
            throw new Error('An inspection record already exists for this vehicle. Cannot start a new one automatically.');
        }

        const inspectionNumber = `INS-${Math.floor(100000 + Math.random() * 900000)}`;

        const { data: inspection, error: inspError } = await supabase
            .from('inspections')
            .insert([{
                vehicle_id: vehicleId,
                inspection_number: inspectionNumber,
                inspection_status: 'DRAFT',
                inspection_date: new Date().toISOString().split('T')[0]
            }])
            .select()
            .single();

        if (inspError) throw new Error(inspError.message);

        if (MASTER_CHECKLIST && MASTER_CHECKLIST.length > 0) {
            const itemsToInsert = MASTER_CHECKLIST.map(item => ({
                inspection_id: inspection.id,
                section: item.section || 'General',
                item_code: item.item_code || '',
                item_name: item.item_name || '',
                status: 'PENDING',
                is_safety_critical: item.is_safety_critical || false,
                sort_order: item.sort_order || 0
            }));

            const { error: itemsError } = await supabase
                .from('inspection_items')
                .insert(itemsToInsert);

            if (itemsError) throw new Error(itemsError.message);
        }

        return this.getInspectionForVehicle(vehicleId);
    },

    /**
     * Updates an individual checklist item.
     */
    async updateInspectionItem(itemId, updateData) {
        if (!itemId) throw new Error('Item ID is required.');

        const { data, error } = await supabase
            .from('inspection_items')
            .update(updateData)
            .eq('id', itemId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    /**
     * Completes an inspection using calculateSectionScore, calculateOverallScore, and getRecommendation from inspectionScoring.
     */
    async completeInspection(inspectionId) {
        if (!inspectionId) throw new Error('Inspection ID is required.');

        const { data: inspection, error: fetchError } = await supabase
            .from('inspections')
            .select(`
                *,
                inspection_items(*)
            `)
            .eq('id', inspectionId)
            .single();

        if (fetchError || !inspection) throw new Error('Inspection not found.');

        const items = inspection.inspection_items || [];

        // Completion Validation: Applicable + PENDING = blocks completion. Non-applicable + PENDING = does not block.
        const pendingItems = items.filter(
            item => item.is_applicable !== false && item.status === 'PENDING'
        );
        if (pendingItems.length > 0) {
            throw new Error('Cannot complete inspection: all applicable items must be assessed (no PENDING items allowed).');
        }

        // Group inspection_items by section
        const sectionsMap = {};
        items.forEach(item => {
            const sec = item.section || 'General';
            if (!sectionsMap[sec]) {
                sectionsMap[sec] = [];
            }
            sectionsMap[sec].push(item);
        });

        const sectionResultsMap = {};
        let totalCriticalCount = 0;

        for (const [sectionName, sectionItems] of Object.entries(sectionsMap)) {
            const sectionResult = inspectionScoring.calculateSectionScore(sectionItems);
            sectionResultsMap[sectionName] = sectionResult;
            if (sectionResult.criticalCount) {
                totalCriticalCount += sectionResult.criticalCount;
            }
        }

        const overallResult = inspectionScoring.calculateOverallScore(sectionResultsMap);
        const overallScore = overallResult.overallScore !== undefined ? overallResult.overallScore : overallResult;

        // Recommendation extraction: ensure a string is stored
        const rawRecommendation = inspectionScoring.getRecommendation 
            ? inspectionScoring.getRecommendation(overallScore, totalCriticalCount) 
            : { text: 'Approved for sale.', badge: 'Approved' };

        const recommendationText = typeof rawRecommendation === 'object' && rawRecommendation !== null 
            ? (rawRecommendation.text || String(rawRecommendation)) 
            : String(rawRecommendation);

        // Derive overall condition based on score thresholds and critical override rules
        let overallCondition = 'GOOD';
        if (overallScore >= 85) {
            overallCondition = 'EXCELLENT';
        } else if (overallScore >= 70) {
            overallCondition = 'GOOD';
        } else if (overallScore >= 50) {
            overallCondition = 'FAIR';
        } else {
            overallCondition = 'POOR';
        }
        if (totalCriticalCount > 0 && overallScore < 50) {
            overallCondition = 'POOR';
        }

        const getSecScore = (...names) => {
            const match = Object.keys(sectionResultsMap).find(sectionName =>
                names.some(name =>
                    sectionName.toLowerCase().includes(name.toLowerCase())
                )
            );

            return match ? sectionResultsMap[match].score : null;
        };

        const mechanical_score = getSecScore('mechanical', 'engine', 'transmission') ?? 100;
        const electrical_score = getSecScore('electrical') ?? 100;
        const body_score = getSecScore('body', 'frame', 'exterior') ?? 100;
        const interior_score = getSecScore('interior') ?? 100;
        const suspension_score = getSecScore('suspension') ?? 100;
        const brake_score = getSecScore('brake') ?? 100;
        const diagnostic_score = getSecScore('diagnostic', 'obd') ?? 100;
        const road_test_score = getSecScore('road test', 'road') ?? 100;

        const { data, error } = await supabase
            .from('inspections')
            .update({
                inspection_status: 'COMPLETED',
                completed_at: new Date().toISOString(),
                overall_score: overallScore,
                overall_condition: overallCondition,
                recommendation: recommendationText,
                mechanical_score,
                electrical_score,
                body_score,
                interior_score,
                suspension_score,
                brake_score,
                diagnostic_score,
                road_test_score
            })
            .eq('id', inspectionId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    /**
     * Uploads a scanner PDF report and attaches it using the authoritative verification_inspection_id relationship.
     */
    async uploadScannerPdf(vehicleId, file) {
        if (!vehicleId) throw new Error('Vehicle ID is required.');
        if (!file || !(file instanceof File)) throw new Error('A valid PDF file is required.');

        const fileExt = file.name.split('.').pop().toLowerCase();
        if (fileExt !== 'pdf') throw new Error('Only PDF files are allowed.');

        const fileName = `inspections/${vehicleId}/scanner_${crypto.randomUUID()}.pdf`;

        const { error: uploadError } = await supabase.storage
            .from('vehicle-photos')
            .upload(fileName, file, {
                upsert: false,
                contentType: 'application/pdf'
            });

        if (uploadError) throw new Error(`Failed to upload scanner report: ${uploadError.message}`);

        const { data: { publicUrl } } = supabase.storage
            .from('vehicle-photos')
            .getPublicUrl(fileName);

        // Locate inspection using authoritative verification_inspection_id
        const { data: vehicleRecord, error: vehicleErr } = await supabase
            .from('vehicles')
            .select('verification_inspection_id')
            .eq('id', vehicleId)
            .single();

        if (vehicleErr || !vehicleRecord || !vehicleRecord.verification_inspection_id) {
            await supabase.storage.from('vehicle-photos').remove([fileName]);
            throw new Error('No authoritative verification inspection relationship exists for this vehicle.');
        }

        const inspectionId = vehicleRecord.verification_inspection_id;

        const { error: updateError } = await supabase
            .from('inspections')
            .update({ scanner_report_path: publicUrl })
            .eq('id', inspectionId);

        if (updateError) {
            await supabase.storage.from('vehicle-photos').remove([fileName]);
            throw new Error(`Failed to save scanner report link: ${updateError.message}`);
        }

        return publicUrl;
    }
};

export const {
    getInspectionForVehicle,
    startNewInspection,
    updateInspectionItem,
    completeInspection,
    uploadScannerPdf
} = inspectionService;
