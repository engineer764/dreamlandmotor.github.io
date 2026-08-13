import { supabase } from './supabaseClient.js';

export const INSPECTION_STATUSES = {
    DRAFT: 'DRAFT',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
};

export const INSPECTION_AREAS = [
    'Mechanical',
    'Computer Diagnostics',
    'Electrical & Electronic',
    'Body & Accident',
    'Chassis / Suspension / Braking',
    'Interior / Functional / Road Test'
];

export const INSPECTION_RATINGS = [
    'PASS',
    'ATTENTION',
    'FAIL'
];

export const inspectionService = {

    /**
     * Creates or resumes the active inspection for a vehicle.
     *
     * A vehicle can have only one active DRAFT/IN_PROGRESS inspection
     * at a time from the workbench.
     */
    async createInspection(vehicleId, inspectionData = {}) {
        if (!vehicleId) {
            throw new Error('Vehicle ID is required.');
        }

        // ------------------------------------------------------------
        // 1. Get vehicle mileage
        // ------------------------------------------------------------
        const { data: vehicle, error: vehicleError } = await supabase
            .from('vehicles')
            .select('id, mileage, year, make, model, trim, vin')
            .eq('id', vehicleId)
            .single();

        if (vehicleError) {
            throw new Error(`Unable to load vehicle: ${vehicleError.message}`);
        }

        if (!vehicle) {
            throw new Error('Vehicle record not found.');
        }

        const suppliedMileage =
            inspectionData.mileage !== undefined &&
            inspectionData.mileage !== null &&
            inspectionData.mileage !== ''
                ? parseInt(inspectionData.mileage, 10)
                : parseInt(vehicle.mileage, 10);

        if (!Number.isInteger(suppliedMileage) || suppliedMileage < 0) {
            throw new Error(
                'Mileage at inspection is required and must be a valid number.'
            );
        }

        // ------------------------------------------------------------
        // 2. Resume an existing active inspection if one exists
        // ------------------------------------------------------------
        const { data: existing, error: existingError } = await supabase
            .from('inspections')
            .select('*')
            .eq('vehicle_id', vehicleId)
            .in('inspection_status', [
                INSPECTION_STATUSES.DRAFT,
                INSPECTION_STATUSES.IN_PROGRESS
            ])
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (existingError) {
            throw new Error(
                `Unable to check existing inspection: ${existingError.message}`
            );
        }

        if (existing) {
            return this.getInspectionDetails(existing.id);
        }

        // ------------------------------------------------------------
        // 3. Create new DRAFT inspection
        // ------------------------------------------------------------
        const inspectionNumber =
            inspectionData.inspection_number ||
            `INSP-${new Date().getFullYear()}-${Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase()}`;

        const payload = {
            vehicle_id: vehicleId,
            inspection_number: inspectionNumber,
            inspection_date:
                inspectionData.inspection_date ||
                new Date().toISOString(),
            mileage: suppliedMileage,
            inspection_status: INSPECTION_STATUSES.DRAFT,
            inspector_id: inspectionData.inspector_id || null,
            started_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('inspections')
            .insert([payload])
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create inspection: ${error.message}`);
        }

        return {
            ...data,
            inspection_findings: []
        };
    },

    /**
     * Fetches an inspection with all findings and evidence photos.
     */
    async getInspectionDetails(inspectionId) {
        if (!inspectionId) {
            throw new Error('Inspection ID is required.');
        }

        const { data, error } = await supabase
            .from('inspections')
            .select(`
                *,
                inspection_findings (
                    id,
                    inspection_id,
                    area,
                    component,
                    rating,
                    severity,
                    finding,
                    significance,
                    recommended_action,
                    estimated_cost,
                    is_safety_critical,
                    created_at,
                    updated_at,
                    finding_photos (
                        id,
                        finding_id,
                        storage_path,
                        public_url,
                        caption,
                        sort_order,
                        created_at
                    )
                )
            `)
            .eq('id', inspectionId)
            .single();

        if (error) {
            throw new Error(
                `Failed to load inspection: ${error.message}`
            );
        }

        return data;
    },

    /**
     * Updates inspection metadata.
     */
    async updateInspection(inspectionId, updateData = {}) {
        if (!inspectionId) {
            throw new Error('Inspection ID is required.');
        }

        const allowedFields = [
            'inspection_date',
            'mileage',
            'inspector_id'
        ];

        const payload = {};

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                payload[field] = updateData[field];
            }
        }

        payload.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('inspections')
            .update(payload)
            .eq('id', inspectionId)
            .select()
            .single();

        if (error) {
            throw new Error(
                `Failed to update inspection: ${error.message}`
            );
        }

        return data;
    },

    /**
     * Moves DRAFT inspection into IN_PROGRESS.
     */
    async startInspection(inspectionId) {
        if (!inspectionId) {
            throw new Error('Inspection ID is required.');
        }

        const { data, error } = await supabase
            .from('inspections')
            .update({
                inspection_status: INSPECTION_STATUSES.IN_PROGRESS,
                started_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', inspectionId)
            .in('inspection_status', [
                INSPECTION_STATUSES.DRAFT,
                INSPECTION_STATUSES.IN_PROGRESS
            ])
            .select()
            .single();

        if (error) {
            throw new Error(
                `Failed to start inspection: ${error.message}`
            );
        }

        return data;
    },

    /**
     * Adds a finding.
     */
    async addInspectionFinding(inspectionId, findingData = {}) {
        if (!inspectionId) {
            throw new Error('Inspection ID is required.');
        }

        if (!INSPECTION_AREAS.includes(findingData.area)) {
            throw new Error(
                `Invalid inspection area: ${findingData.area || 'not specified'}`
            );
        }

        const rating = findingData.rating || 'PASS';

        if (!INSPECTION_RATINGS.includes(rating)) {
            throw new Error(`Invalid inspection rating: ${rating}`);
        }

        const severity = parseInt(findingData.severity, 10);

        if (!Number.isInteger(severity) || severity < 1 || severity > 5) {
            throw new Error(
                'Severity must be an integer from 1 to 5.'
            );
        }

        if (
            rating !== 'PASS' &&
            (
                !findingData.finding?.trim() ||
                !findingData.significance?.trim() ||
                !findingData.recommended_action?.trim()
            )
        ) {
            throw new Error(
                'ATTENTION and FAIL require a finding, significance, and recommended action.'
            );
        }

        const payload = {
            inspection_id: inspectionId,
            area: findingData.area,
            component: findingData.component?.trim() || 'General',
            rating,
            severity,
            finding:
                findingData.finding?.trim() ||
                'No faults observed.',
            significance:
                findingData.significance?.trim() ||
                'N/A',
            recommended_action:
                findingData.recommended_action?.trim() ||
                'None',
            estimated_cost:
                findingData.estimated_cost !== undefined &&
                findingData.estimated_cost !== null &&
                findingData.estimated_cost !== ''
                    ? parseFloat(findingData.estimated_cost)
                    : null,
            is_safety_critical:
                Boolean(findingData.is_safety_critical)
        };

        const { data, error } = await supabase
            .from('inspection_findings')
            .insert([payload])
            .select()
            .single();

        if (error) {
            throw new Error(
                `Failed to save finding: ${error.message}`
            );
        }

        // Automatically move inspection from DRAFT to IN_PROGRESS.
        await this.startInspection(inspectionId);

        return data;
    },

    /**
     * Deletes an inspection finding.
     */
    async deleteInspectionFinding(findingId) {
        if (!findingId) {
            throw new Error('Finding ID is required.');
        }

        // Get associated photos first.
        const { data: photos } = await supabase
            .from('finding_photos')
            .select('storage_path')
            .eq('finding_id', findingId);

        if (photos?.length) {
            const paths = photos
                .map(photo => photo.storage_path)
                .filter(Boolean);

            if (paths.length) {
                await supabase.storage
                    .from('vehicle-photos')
                    .remove(paths);
            }
        }

        const { error } = await supabase
            .from('inspection_findings')
            .delete()
            .eq('id', findingId);

        if (error) {
            throw new Error(
                `Failed to delete finding: ${error.message}`
            );
        }

        return true;
    },

    /**
     * Uploads evidence photo for a finding.
     */
    async uploadFindingPhoto(findingId, file, options = {}) {
        if (!findingId) {
            throw new Error('Finding ID is required.');
        }

        if (!file || !(file instanceof File)) {
            throw new Error('A valid image file is required.');
        }

        if (!file.type.startsWith('image/')) {
            throw new Error('Evidence file must be an image.');
        }

        const extension =
            file.name.split('.').pop()?.toLowerCase() || 'jpg';

        const fileName =
            `findings/${findingId}/` +
            `${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 8)}.${extension}`;

        const { error: uploadError } = await supabase.storage
            .from('vehicle-photos')
            .upload(fileName, file);

        if (uploadError) {
            throw new Error(
                `Failed to upload evidence: ${uploadError.message}`
            );
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
                caption: options.caption?.trim() || null,
                sort_order:
                    options.sort_order !== undefined
                        ? parseInt(options.sort_order, 10)
                        : 0
            }])
            .select()
            .single();

        if (error) {
            await supabase.storage
                .from('vehicle-photos')
                .remove([fileName]);

            throw new Error(
                `Failed to save evidence record: ${error.message}`
            );
        }

        return data;
    },

    /**
     * Deletes a finding photo.
     */
    async deleteFindingPhoto(photoId) {
        if (!photoId) {
            throw new Error('Photo ID is required.');
        }

        const { data: photo, error: fetchError } = await supabase
            .from('finding_photos')
            .select('storage_path')
            .eq('id', photoId)
            .single();

        if (fetchError || !photo) {
            throw new Error('Finding photo not found.');
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
            throw new Error(
                `Failed to delete photo: ${error.message}`
            );
        }

        return true;
    },

    /**
     * Completes an inspection.
     *
     * Vehicle publication is deliberately NOT performed here.
     */
    async completeInspection(inspectionId, finalData = {}) {
        if (!inspectionId) {
            throw new Error('Inspection ID is required.');
        }

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

        const payload = {};

        for (const field of allowedFields) {
            if (finalData[field] !== undefined) {
                payload[field] = finalData[field];
            }
        }

        payload.inspection_status = INSPECTION_STATUSES.COMPLETED;
        payload.completed_at = new Date().toISOString();
        payload.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('inspections')
            .update(payload)
            .eq('id', inspectionId)
            .in('inspection_status', [
                INSPECTION_STATUSES.DRAFT,
                INSPECTION_STATUSES.IN_PROGRESS
            ])
            .select()
            .single();

        if (error) {
            throw new Error(
                `Failed to complete inspection: ${error.message}`
            );
        }

        return data;
    },

    /**
     * Cancels an active inspection.
     */
    async cancelInspection(inspectionId) {
        const { data, error } = await supabase
            .from('inspections')
            .update({
                inspection_status: INSPECTION_STATUSES.CANCELLED,
                updated_at: new Date().toISOString()
            })
            .eq('id', inspectionId)
            .in('inspection_status', [
                INSPECTION_STATUSES.DRAFT,
                INSPECTION_STATUSES.IN_PROGRESS
            ])
            .select()
            .single();

        if (error) {
            throw new Error(
                `Failed to cancel inspection: ${error.message}`
            );
        }

        return data;
    },

    /**
     * Uploads official PDF report.
     */
    async uploadInspectionReport(inspectionId, file) {
        if (!file || !(file instanceof File)) {
            throw new Error('A valid PDF file is required.');
        }

        if (file.type !== 'application/pdf') {
            throw new Error('Inspection report must be a PDF.');
        }

        const fileName =
            `reports/${inspectionId}/official_report.pdf`;

        const { error: uploadError } = await supabase.storage
            .from('vehicle-photos')
            .upload(fileName, file, {
                upsert: true,
                contentType: 'application/pdf'
            });

        if (uploadError) {
            throw new Error(
                `Failed to upload report: ${uploadError.message}`
            );
        }

        const {
            data: { publicUrl }
        } = supabase.storage
            .from('vehicle-photos')
            .getPublicUrl(fileName);

        const { data, error } = await supabase
            .from('inspections')
            .update({
                report_path: publicUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', inspectionId)
            .select()
            .single();

        if (error) {
            throw new Error(
                `Failed to link inspection report: ${error.message}`
            );
        }

        return data;
    }
};

// ------------------------------------------------------------
// Backward-compatible named exports
// ------------------------------------------------------------

export const createInspection =
    inspectionService.createInspection.bind(inspectionService);

export const getInspectionDetails =
    inspectionService.getInspectionDetails.bind(inspectionService);

export const updateInspection =
    inspectionService.updateInspection.bind(inspectionService);

export const startInspection =
    inspectionService.startInspection.bind(inspectionService);

export const addInspectionFinding =
    inspectionService.addInspectionFinding.bind(inspectionService);

export const deleteInspectionFinding =
    inspectionService.deleteInspectionFinding.bind(inspectionService);

export const uploadFindingPhoto =
    inspectionService.uploadFindingPhoto.bind(inspectionService);

export const deleteFindingPhoto =
    inspectionService.deleteFindingPhoto.bind(inspectionService);

export const completeInspection =
    inspectionService.completeInspection.bind(inspectionService);

export const cancelInspection =
    inspectionService.cancelInspection.bind(inspectionService);

export const uploadInspectionReport =
    inspectionService.uploadInspectionReport.bind(inspectionService);
