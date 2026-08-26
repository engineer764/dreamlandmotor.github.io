import { MASTER_CHECKLIST } from './masterChecklist.js';
import { inspectionScoring } from './inspectionScoring.js';
import { supabase } from './supabaseClient.js';

/**
 * Retrieves the existing inspection for a vehicle (Read-only).
 * Never creates an inspection.
 * Uses maybeSingle().
 */
export async function getInspectionForVehicle(vehicleId) {
    if (!vehicleId) return null;

    const { data, error } = await supabase
        .from('inspections')
        .select(`
            *,
            inspection_items (*)
        `)
        .eq('vehicle_id', vehicleId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching inspection for vehicle:', error);
        throw error;
    }

    return data;
}

/**
 * Starts a new inspection for a vehicle.
 * Called ONLY from an explicit START NEW INSPECTION action.
 * Handles concurrency / unique constraint gracefully.
 */
export async function startNewInspection(vehicleId) {
    if (!vehicleId) {
        throw new Error('Vehicle ID is required to start an inspection.');
    }

    // 1. Check if inspection already exists
    const existing = await getInspectionForVehicle(vehicleId);
    if (existing) {
        return existing;
    }

    // 2. Fetch vehicle data for initial mileage
    const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', vehicleId)
        .single();

    if (vehicleError || !vehicle) {
        throw new Error('Vehicle not found for inspection initialization.');
    }

    const inspectionNumber = `INS-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    const newInspectionPayload = {
        vehicle_id: vehicleId,
        inspection_number: inspectionNumber,
        inspection_status: 'IN_PROGRESS',
        mileage: vehicle.mileage || 0,
        created_at: now,
        updated_at: now
    };

    // 3. Insert inspection
    const { data: insertedInspection, error: insertError } = await supabase
        .from('inspections')
        .insert([newInspectionPayload])
        .select('*')
        .single();

    // Handle concurrent creation / unique constraint violation gracefully
    if (insertError) {
        const existingConcurrent = await getInspectionForVehicle(vehicleId);
        if (existingConcurrent) {
            return existingConcurrent;
        }
        console.error('Error inserting inspection:', insertError);
        throw insertError;
    }

    // 4. Instantiate MASTER_CHECKLIST into inspection_items
    const inspectionItemsPayload = MASTER_CHECKLIST.map(item => {
        const isDefaultApplicable = item.default_applicable !== false;
        return {
            inspection_id: insertedInspection.id,
            section: item.section,
            item_code: item.item_code,
            item_name: item.item_name,
            sort_order: item.sort_order,
            is_safety_critical: item.is_safety_critical || false,
            is_applicable: isDefaultApplicable,
            status: isDefaultApplicable ? 'PENDING' : 'N/A'
        };
    });

    const { error: itemsError } = await supabase
        .from('inspection_items')
        .insert(inspectionItemsPayload);

    if (itemsError) {
        console.error('Error inserting inspection items. Rolling back inspection record...', itemsError);
        // Rollback orphan inspection row via delete if items insert fails
        await supabase
            .from('inspections')
            .delete()
            .eq('id', insertedInspection.id);
        throw itemsError;
    }

    // 5. Return complete inspection with items
    return await getInspectionForVehicle(vehicleId);
}

/**
 * Updates a specific inspection item.
 * Validates allowed status values and manages applicability.
 * Never creates an inspection.
 */
export async function updateInspectionItem(itemId, updates) {
    if (!itemId) {
        throw new Error('Item ID is required for update.');
    }

    const allowedStatuses = ['PENDING', 'GOOD', 'FAIR', 'ATTENTION', 'CRITICAL', 'N/A'];
    const dbUpdates = {
        updated_at: new Date().toISOString()
    };

    if (updates.status !== undefined) {
        if (!allowedStatuses.includes(updates.status)) {
            throw new Error(`Invalid status: ${updates.status}`);
        }
        dbUpdates.status = updates.status;

        if (updates.status === 'N/A') {
            dbUpdates.is_applicable = false;
        } else if (updates.is_applicable === undefined) {
            dbUpdates.is_applicable = true;
        }
    }

    if (updates.is_applicable !== undefined) {
        dbUpdates.is_applicable = Boolean(updates.is_applicable);
        if (!dbUpdates.is_applicable && dbUpdates.status !== 'N/A') {
            dbUpdates.status = 'N/A';
        }
    }

    // Map frontend "notes" to database "observation" column (no "notes" column exists)
    if (updates.notes !== undefined) {
        dbUpdates.observation = updates.notes;
    }

    // Map other supported database fields if supplied
    const supportedFields = [
        'observation',
        'recommended_action',
        'estimated_cost',
        'measurement_value',
        'measurement_unit',
        'is_safety_critical'
    ];

    for (const field of supportedFields) {
        if (updates[field] !== undefined) {
            dbUpdates[field] = updates[field];
        }
    }

    const { data, error } = await supabase
        .from('inspection_items')
        .update(dbUpdates)
        .eq('id', itemId)
        .select('*')
        .single();

    if (error) {
        console.error('Error updating inspection item:', error);
        throw error;
    }

    return data;
}

/**
 * Completes an inspection after validating that no applicable items remain PENDING.
 * Calculates scores using the centralized inspectionScoring engine.
 * Updates ONLY the existing inspection ID.
 */
export async function completeInspection(inspectionId) {
    if (!inspectionId) {
        throw new Error('Inspection ID is required for completion.');
    }

    // 1. Retrieve existing inspection and items
    const { data: inspection, error: inspError } = await supabase
        .from('inspections')
        .select('*')
        .eq('id', inspectionId)
        .single();

    if (inspError || !inspection) {
        throw new Error('Inspection not found.');
    }

    const { data: items, error: itemsError } = await supabase
        .from('inspection_items')
        .select('*')
        .eq('inspection_id', inspectionId);

    if (itemsError || !items) {
        throw new Error('Failed to retrieve inspection items for completion.');
    }

    // 2. Reject completion if any applicable item remains PENDING
    const pendingApplicableItems = items.filter(
        item => item.is_applicable === true && item.status === 'PENDING'
    );

    if (pendingApplicableItems.length > 0) {
        throw new Error(`Cannot complete inspection. ${pendingApplicableItems.length} applicable item(s) remain PENDING.`);
    }

    // 3. Build section results map for centralized scoring engine
    const allSections = [...new Set(items.map(i => i.section))];
    const sectionResultsMap = {};
    for (const sec of allSections) {
        const secItems = items.filter(i => i.section === sec);
        sectionResultsMap[sec] = inspectionScoring.calculateSectionScore(secItems);
    }

    const overallResult = inspectionScoring.calculateOverallScore(sectionResultsMap);
    const overallScore = overallResult.overallScore;

    const rawRecommendation = overallResult.recommendation;
    const recommendationText =
        typeof rawRecommendation === 'string'
            ? rawRecommendation
            : rawRecommendation?.text || String(rawRecommendation || '');

    // Derive overall condition from centralized result/recommendation without numeric score thresholds
    let overallCondition = overallResult.condition || overallResult.overallCondition;
    if (!overallCondition) {
        const recStr = String(rawRecommendation?.code || rawRecommendation?.badge || recommendationText).toUpperCase();
        if (recStr.includes('REJECT') || recStr.includes('POOR') || recStr.includes('FAIL')) {
            overallCondition = 'POOR';
        } else if (recStr.includes('ATTENTION') || recStr.includes('FAIR') || recStr.includes('ADVISORY')) {
            overallCondition = 'FAIR';
        } else {
            overallCondition = 'GOOD';
        }
    }

    const now = new Date().toISOString();

    const updatePayload = {
        inspection_status: 'COMPLETED',
        overall_score: overallScore,
        overall_condition: overallCondition,
        recommendation: recommendationText,
        completed_at: now,
        updated_at: now
    };

    // 4. Calculate broad category score columns directly from underlying applicable items (no section score averaging)
    const getBroadCategoryScore = (sectionNames) => {
        const groupItems = items.filter(item =>
            item.is_applicable !== false &&
            item.status !== 'N/A' &&
            item.status !== 'PENDING' &&
            sectionNames.includes(item.section)
        );
        if (groupItems.length === 0) return null;
        const result = inspectionScoring.calculateSectionScore(groupItems);
        return result.score;
    };

    const mechanicalScore = getBroadCategoryScore(['Engine', 'Cooling', 'Transmission', 'Steering', 'WheelsTyres']);
    if (mechanicalScore !== null) updatePayload.mechanical_score = mechanicalScore;

    const electricalScore = getBroadCategoryScore(['Electrical']);
    if (electricalScore !== null) updatePayload.electrical_score = electricalScore;

    const bodyScore = getBroadCategoryScore(['Body']);
    if (bodyScore !== null) updatePayload.body_score = bodyScore;

    const interiorScore = getBroadCategoryScore(['Interior', 'HVAC']);
    if (interiorScore !== null) updatePayload.interior_score = interiorScore;

    const suspensionScore = getBroadCategoryScore(['Suspension']);
    if (suspensionScore !== null) updatePayload.suspension_score = suspensionScore;

    const brakeScore = getBroadCategoryScore(['Brakes']);
    if (brakeScore !== null) updatePayload.brake_score = brakeScore;

    const diagnosticScore = getBroadCategoryScore(['Diagnostics']);
    if (diagnosticScore !== null) updatePayload.diagnostic_score = diagnosticScore;

    const roadTestScore = getBroadCategoryScore(['RoadTest']);
    if (roadTestScore !== null) updatePayload.road_test_score = roadTestScore;

    // 5. Update ONLY the existing inspection ID
    const { data: updatedInspection, error: updateError } = await supabase
        .from('inspections')
        .update(updatePayload)
        .eq('id', inspectionId)
        .select('*')
        .single();

    if (updateError) {
        console.error('Error completing inspection:', updateError);
        throw updateError;
    }

    return updatedInspection;
}

/**
 * Uploads a scanner PDF report for a vehicle's existing inspection.
 * Never creates an inspection.
 * Safely replaces existing reports and rolls back on storage/DB failure.
 */
export async function uploadScannerPdf(vehicleId, file) {
    if (!vehicleId) {
        throw new Error('Vehicle ID is required for scanner PDF upload.');
    }
    if (!file) {
        throw new Error('File is required.');
    }

    // Validate PDF type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error('Only PDF files are allowed for scanner reports.');
    }

    // Find EXISTING inspection
    const inspection = await getInspectionForVehicle(vehicleId);
    if (!inspection) {
        throw new Error('No existing inspection found for this vehicle. Cannot upload scanner report.');
    }

    const oldScannerPath = inspection.scanner_report_path;

    const fileExt = 'pdf';
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${vehicleId}/${fileName}`;

    // 1. Upload new PDF to vehicle-photos storage bucket
    const { error: uploadError } = await supabase.storage
        .from('vehicle-photos')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'application/pdf'
        });

    if (uploadError) {
        console.error('Error uploading scanner PDF to storage:', uploadError);
        throw uploadError;
    }

    // Get public URL for new file
    const { data: publicUrlData } = supabase.storage
        .from('vehicle-photos')
        .getPublicUrl(filePath);

    const publicUrl = publicUrlData?.publicUrl;

    // 2. Update scanner_report_path on existing inspection
    const { data: updatedInspection, error: dbError } = await supabase
        .from('inspections')
        .update({
            scanner_report_path: publicUrl,
            updated_at: new Date().toISOString()
        })
        .eq('id', inspection.id)
        .select('*')
        .single();

    if (dbError) {
        console.error('Error updating scanner_report_path in database. If blocked by database triggers on completed inspections, the database trigger policy must be updated. Rolling back newly uploaded storage file...', dbError);
        await supabase.storage
            .from('vehicle-photos')
            .remove([filePath]);
        throw dbError;
    }

    // 3. ONLY AFTER successful database update, remove the previous scanner PDF if it exists
    if (oldScannerPath && oldScannerPath.includes('/vehicle-photos/')) {
        try {
            const urlObj = new URL(oldScannerPath);
            const pathParts = urlObj.pathname.split('/vehicle-photos/');
            if (pathParts.length > 1) {
                const oldFilePath = pathParts[1];
                await supabase.storage
                    .from('vehicle-photos')
                    .remove([oldFilePath]);
            }
        } catch (cleanupErr) {
            console.warn('Could not clean up old scanner PDF from storage (non-fatal):', cleanupErr);
        }
    }

    return updatedInspection;
}import { supabase } from './supabaseClient.js';
import { inspectionScoring } from './inspectionScoring.js';

export const inspectionService = {

    /**
     * ============================================================
     * INSPECTION LOOKUP
     * ============================================================
     *
     * IMPORTANT:
     * These methods ONLY READ existing inspections.
     * They must NEVER create a new inspection.
     */

    async getInspectionsForVehicle(vehicleId) {
        if (!vehicleId) {
            throw new Error('Vehicle ID is required.');
        }

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

        if (error) {
            throw new Error(error.message);
        }

        return data || [];
    },

    /**
     * Gets the most recent existing inspection for a vehicle.
     *
     * THIS DOES NOT CREATE AN INSPECTION.
     *
     * Used by existing inspection workflows.
     */
    async getInspectionForVehicle(vehicleId) {
        if (!vehicleId) {
            throw new Error('Vehicle ID is required.');
        }

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
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            throw new Error(error.message);
        }

        return data || null;
    },

    async getInspectionById(inspectionId) {
        if (!inspectionId) {
            throw new Error('Inspection ID is required.');
        }

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

        if (error) {
            throw new Error(error.message);
        }

        return data;
    },

    async getInspectionDetails(inspectionId) {
        return this.getInspectionById(inspectionId);
    },


    /**
     * ============================================================
     * CREATE INSPECTION
     * ============================================================
     *
     * IMPORTANT:
     *
     * This method is ONLY for explicitly starting a new inspection.
     *
     * Existing inspections of ANY status are recognized.
     *
     * It will NOT create another inspection merely because an
     * existing inspection is COMPLETED.
     */

    async createInspection(vehicleId, initialData = {}) {
        if (!vehicleId) {
            throw new Error('Vehicle ID is required.');
        }

        /*
         * Look for ANY existing inspection.
         *
         * We deliberately do NOT filter by:
         * DRAFT
         * IN_PROGRESS
         *
         * because COMPLETED inspections must also be recognized.
         */
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
            .order('created_at', { ascending: false })
            .limit(1);

        if (fetchError) {
            throw new Error(fetchError.message);
        }

        /*
         * SAFETY:
         *
         * If an inspection exists, return it.
         *
         * This prevents:
         *
         * COMPLETED inspection
         *      ↓
         * createInspection()
         *      ↓
         * duplicate inspection
         */
        if (existingList && existingList.length > 0) {
            return existingList[0];
        }

        /*
         * No inspection exists at all.
         *
         * Only now do we create one.
         */
        const { data: vehicle, error: vError } = await supabase
            .from('vehicles')
            .select('mileage')
            .eq('id', vehicleId)
            .single();

        if (vError) {
            throw new Error(
                'Vehicle not found for inspection initialization.'
            );
        }

        const inspectionNumber =
            `INS-${Math.floor(100000 + Math.random() * 900000)}`;

        const parsedMileage =
            initialData.mileage !== undefined &&
            initialData.mileage !== null &&
            initialData.mileage !== ''
                ? Number(initialData.mileage)
                : Number(vehicle?.mileage || 0);

        if (!Number.isInteger(parsedMileage) || parsedMileage < 0) {
            throw new Error('Inspection mileage must be a valid integer.');
        }

        const now = new Date().toISOString();

        const payload = {
            vehicle_id: vehicleId,
            inspector_id: initialData.inspector_id || null,
            inspection_number: inspectionNumber,
            inspection_date:
                initialData.inspection_date ||
                new Date().toISOString().split('T')[0],
            mileage: parsedMileage,
            inspection_status: 'DRAFT',
            created_at: now,
            updated_at: now
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

        if (createError) {
            throw new Error(createError.message);
        }

        return newInsp;
    },


    /**
     * ============================================================
     * UPDATE INSPECTION
     * ============================================================
     */

    async updateInspectionDetails(inspectionId, updates) {
        if (!inspectionId) {
            throw new Error('Inspection ID is required.');
        }

        if (!updates || typeof updates !== 'object') {
            throw new Error('Inspection update data is required.');
        }

        const payload = {
            ...updates,
            updated_at: new Date().toISOString()
        };

        /*
         * IMPORTANT:
         * We update by the EXISTING inspection ID.
         *
         * No inspection creation happens here.
         */
        const { data, error } = await supabase
            .from('inspections')
            .update(payload)
            .eq('id', inspectionId)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    },


    /**
     * ============================================================
     * VEHICLE MILEAGE SYNCHRONIZATION
     * ============================================================
     *
     * Use this when Admin corrects the vehicle mileage.
     *
     * It updates the EXISTING inspection.
     * It does NOT create a new inspection.
     * It does NOT change inspection_number.
     */

    async syncVehicleMileage(vehicleId, mileage) {
        if (!vehicleId) {
            throw new Error('Vehicle ID is required.');
        }

        const parsedMileage = Number(mileage);

        if (!Number.isInteger(parsedMileage) || parsedMileage < 0) {
            throw new Error('Mileage must be a valid non-negative integer.');
        }

        const inspection = await this.getInspectionForVehicle(vehicleId);

        if (!inspection) {
            /*
             * Important:
             * Do NOT create an inspection automatically.
             */
            return null;
        }

        const { data, error } = await supabase
            .from('inspections')
            .update({
                mileage: parsedMileage,
                updated_at: new Date().toISOString()
            })
            .eq('id', inspection.id)
            .select()
            .single();

        if (error) {
            throw new Error(
                `Failed to synchronize inspection mileage: ${error.message}`
            );
        }

        return data;
    },


    /**
     * ============================================================
     * FINDINGS
     * ============================================================
     */

    async addInspectionFinding(inspectionId, findingData) {
        if (!inspectionId) {
            throw new Error('Inspection ID is required.');
        }

        const allowedRatings = [
            'GOOD',
            'FAIR',
            'ATTENTION',
            'CRITICAL'
        ];

        const rating =
            String(findingData.rating || 'GOOD').toUpperCase();

        if (!allowedRatings.includes(rating)) {
            throw new Error(
                `Invalid finding rating: ${rating}. ` +
                `Allowed values: GOOD, FAIR, ATTENTION, CRITICAL.`
            );
        }

        const severity = Number(findingData.severity);

        if (!Number.isInteger(severity) || severity < 1 || severity > 5) {
            throw new Error('Severity must be an integer from 1 to 5.');
        }

        const payload = {
            inspection_id: inspectionId,
            area: findingData.area,
            component: findingData.component?.trim() || null,
            rating,
            severity,
            finding: findingData.finding?.trim() || '',
            significance: findingData.significance?.trim() || null,
            recommended_action:
                findingData.recommended_action?.trim() || null,
            estimated_cost:
                findingData.estimated_cost !== undefined &&
                findingData.estimated_cost !== null &&
                findingData.estimated_cost !== ''
                    ? Number(findingData.estimated_cost)
                    : null,
            is_safety_critical:
                Boolean(findingData.is_safety_critical)
        };

        /*
         * DRAFT → IN_PROGRESS
         *
         * This only changes the status of the EXISTING inspection.
         */
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
                .select(`
                    *,
                    finding_photos (*)
                `)
                .single();

            if (error) {
                throw new Error(error.message);
            }

            result = data;
        } else {
            const { data, error } = await supabase
                .from('inspection_findings')
                .insert([payload])
                .select(`
                    *,
                    finding_photos (*)
                `)
                .single();

            if (error) {
                throw new Error(error.message);
            }

            result = data;
        }

        return result;
    },

    async saveFinding(inspectionId, findingData) {
        return this.addInspectionFinding(
            inspectionId,
            findingData
        );
    },


    async deleteInspectionFinding(findingId) {
        if (!findingId) {
            throw new Error('Finding ID is required.');
        }

        const { error } = await supabase
            .from('inspection_findings')
            .delete()
            .eq('id', findingId);

        if (error) {
            throw new Error(error.message);
        }

        return true;
    },

    async deleteFinding(findingId) {
        return this.deleteInspectionFinding(findingId);
    },


    /**
     * ============================================================
     * FINDING PHOTOS
     * ============================================================
     */

    async uploadFindingPhoto(findingId, file, caption = null) {
        if (!findingId || !file) {
            throw new Error(
                'Finding ID and file are required.'
            );
        }

        const fileExt =
            file.name.split('.').pop().toLowerCase();

        const fileName =
            `findings/${findingId}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } =
            await supabase.storage
                .from('vehicle-photos')
                .upload(fileName, file);

        if (uploadError) {
            throw new Error(uploadError.message);
        }

        const {
            data: { publicUrl }
        } = supabase.storage
            .from('vehicle-photos')
            .getPublicUrl(fileName);

        const { data, error } = await supabase
            .from('finding_photos')
            .insert([{
                finding_id: findingId,
                storage_path: fileName,
                public_url: publicUrl,
                caption
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


    async deleteFindingPhoto(photoId) {
        if (!photoId) {
            throw new Error('Photo ID is required.');
        }

        const {
            data: photo,
            error: fetchErr
        } = await supabase
            .from('finding_photos')
            .select('*')
            .eq('id', photoId)
            .single();

        if (fetchErr || !photo) {
            throw new Error('Photo not found.');
        }

        if (photo.storage_path) {
            await supabase.storage
                .from('vehicle-photos')
                .remove([photo.storage_path]);
        }

        const { error } = await supabase
            .from('finding_photos')
            .delete()
            .eq('id', photoId);

        if (error) {
            throw new Error(error.message);
        }

        return true;
    },


    /**
     * ============================================================
     * COMPLETE INSPECTION
     * ============================================================
     */

    async completeInspection(inspectionId, finalData = {}) {
        if (!inspectionId) {
            throw new Error('Inspection ID is required.');
        }

        const inspection =
            await this.getInspectionById(inspectionId);

        const findings =
            inspection.inspection_findings || [];

        const computedScores =
            inspectionScoring.calculateScores(findings);

        const payload = {
            overall_score:
                computedScores.overall_score,

            mechanical_score:
                computedScores.mechanical_score,

            electrical_score:
                computedScores.electrical_score,

            body_score:
                computedScores.body_score,

            interior_score:
                computedScores.interior_score,

            suspension_score:
                computedScores.suspension_score,

            brake_score:
                computedScores.brake_score,

            diagnostic_score:
                computedScores.diagnostic_score,

            road_test_score:
                computedScores.road_test_score,

            overall_condition:
                finalData.overall_condition ||
                computedScores.overall_condition,

            recommendation:
                finalData.recommendation ||
                computedScores.recommendation,

            summary:
                finalData.summary ||
                computedScores.summary,

            inspection_status: 'COMPLETED',

            completed_at:
                new Date().toISOString(),

            updated_at:
                new Date().toISOString()
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

        if (error) {
            throw new Error(error.message);
        }

        return data;
    },


    /**
     * ============================================================
     * CANCEL INSPECTION
     * ============================================================
     */

    async cancelInspection(inspectionId) {
        if (!inspectionId) {
            throw new Error('Inspection ID is required.');
        }

        const { data, error } = await supabase
            .from('inspections')
            .update({
                inspection_status: 'CANCELLED',
                updated_at: new Date().toISOString()
            })
            .eq('id', inspectionId)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    },


    /**
     * ============================================================
     * DELETE INSPECTION
     * ============================================================
     *
     * Development-stage rule:
     *
     * An administrator may delete an inspection regardless of
     * inspection_status.
     *
     * This method deliberately does NOT check:
     *
     * DRAFT
     * IN_PROGRESS
     * COMPLETED
     * CANCELLED
     *
     * The database must also allow the DELETE.
     */

    async deleteInspection(inspectionId) {
        if (!inspectionId) {
            throw new Error('Inspection ID is required.');
        }

        /*
         * Get findings first so we can remove their photos
         * from Storage before deleting database records.
         */
        const { data: findings, error: findingsError } =
            await supabase
                .from('inspection_findings')
                .select(`
                    id,
                    finding_photos (
                        id,
                        storage_path
                    )
                `)
                .eq('inspection_id', inspectionId);

        if (findingsError) {
            throw new Error(
                `Failed to inspect dependent findings: ${findingsError.message}`
            );
        }

        /*
         * Remove finding photo files from Storage.
         */
        const storagePaths = [];

        for (const finding of findings || []) {
            for (const photo of finding.finding_photos || []) {
                if (photo.storage_path) {
                    storagePaths.push(photo.storage_path);
                }
            }
        }

        if (storagePaths.length > 0) {
            const { error: storageError } =
                await supabase.storage
                    .from('vehicle-photos')
                    .remove(storagePaths);

            if (storageError) {
                throw new Error(
                    `Failed to remove finding photos: ${storageError.message}`
                );
            }
        }

        /*
         * Delete finding photo database rows.
         */
        for (const finding of findings || []) {
            const { error: findingPhotoDeleteError } =
                await supabase
                    .from('finding_photos')
                    .delete()
                    .eq('finding_id', finding.id);

            if (findingPhotoDeleteError) {
                throw new Error(
                    `Failed to delete finding photos: ${findingPhotoDeleteError.message}`
                );
            }
        }

        /*
         * Delete findings.
         */
        const { error: findingsDeleteError } =
            await supabase
                .from('inspection_findings')
                .delete()
                .eq('inspection_id', inspectionId);

        if (findingsDeleteError) {
            throw new Error(
                `Failed to delete inspection findings: ${findingsDeleteError.message}`
            );
        }

        /*
         * Finally delete the inspection itself.
         */
        const { error: inspectionDeleteError } =
            await supabase
                .from('inspections')
                .delete()
                .eq('id', inspectionId);

        if (inspectionDeleteError) {
            throw new Error(
                `Failed to delete inspection: ${inspectionDeleteError.message}`
            );
        }

        return true;
    }
};


/**
 * ============================================================
 * NAMED EXPORTS
 * ============================================================
 */

export const {
    getInspectionsForVehicle,
    getInspectionForVehicle,
    getInspectionById,
    getInspectionDetails,
    createInspection,
    updateInspectionDetails,
    syncVehicleMileage,
    addInspectionFinding,
    saveFinding,
    deleteInspectionFinding,
    deleteFinding,
    uploadFindingPhoto,
    deleteFindingPhoto,
    completeInspection,
    cancelInspection,
    deleteInspection
} = inspectionService;
