import { supabase } from './supabaseClient.js';

export const vehicleService = {
    /**
     * ==========================================
     * ADMIN & INVENTORY MANAGEMENT METHODS
     * ==========================================
     */

    /**
     * Fetches all vehicles for the admin inventory dashboard.
     */
    async getAllVehicles() {
        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data || [];
    },

    async getAdminVehicles() {
        return this.getAllVehicles();
    },

    /**
     * Fetches a single vehicle by its UUID.
     */
    async getVehicleById(vehicleId) {
        if (!vehicleId) throw new Error('Vehicle ID is required.');

        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .eq('id', vehicleId)
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    /**
     * Creates a new vehicle record in inventory.
     */
    async createVehicle(vehicleData) {
        const payload = {
            ...vehicleData,
            vehicle_code: vehicleData.vehicle_code || `DV-${Math.floor(100 + Math.random() * 900)}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('vehicles')
            .insert([payload])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    /**
     * Updates an existing vehicle record.
     */
    async updateVehicle(vehicleId, updateData) {
        const { data, error } = await supabase
            .from('vehicles')
            .update({
                ...updateData,
                updated_at: new Date().toISOString()
            })
            .eq('id', vehicleId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    /**
     * Updates vehicle price.
     */
    async updateVehiclePrice(vehicleId, newPrice) {
        return this.updateVehicle(vehicleId, { price: parseFloat(newPrice) });
    },

    /**
     * Vehicle Lifecycle Actions (Aligned with verification_status, publication_status, sales_status)
     */
    async verifyVehicle(vehicleId, reference = null) {
        return this.updateVehicle(vehicleId, {
            verification_status: 'VERIFIED',
            verification_reference: reference || `VER-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            verified_at: new Date().toISOString()
        });
    },

    async rejectVehicle(vehicleId) {
        return this.updateVehicle(vehicleId, { verification_status: 'REJECTED' });
    },

    async publishVehicle(vehicleId) {
        return this.updateVehicle(vehicleId, { publication_status: 'PUBLISHED' });
    },

    async unpublishVehicle(vehicleId) {
        return this.updateVehicle(vehicleId, { publication_status: 'DRAFT' });
    },

    async reserveVehicle(vehicleId) {
        return this.updateVehicle(vehicleId, { sales_status: 'RESERVED' });
    },

    async markAvailable(vehicleId) {
        return this.updateVehicle(vehicleId, { sales_status: 'AVAILABLE' });
    },

    async markSold(vehicleId) {
        return this.updateVehicle(vehicleId, { sales_status: 'SOLD' });
    },

    async archiveVehicle(vehicleId) {
        return this.updateVehicle(vehicleId, { publication_status: 'ARCHIVED' });
    },

    /**
     * Uploads a vehicle gallery photo to Supabase Storage and creates a vehicle_photos record.
     */
    async uploadVehiclePhoto(vehicleId, file, options = {}) {
        if (!file || !(file instanceof File)) {
            throw new Error('A valid file is required.');
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `inventory/${vehicleId}/${Math.random().toString(36).substring(2, 10)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('vehicle-photos')
            .upload(fileName, file);

        if (uploadError) throw new Error(uploadError.message);

        const { data: { publicUrl } } = supabase.storage
            .from('vehicle-photos')
            .getPublicUrl(fileName);

        const isPrimary = options.is_primary || false;

        if (isPrimary) {
            await supabase
                .from('vehicle_photos')
                .update({ is_primary: false })
                .eq('vehicle_id', vehicleId);
        }

        const { data, error } = await supabase
            .from('vehicle_photos')
            .insert([{
                vehicle_id: vehicleId,
                storage_path: fileName,
                public_url: publicUrl,
                is_primary: isPrimary,
                sort_order: options.sort_order !== undefined ? parseInt(options.sort_order, 10) : 0,
                category: options.category || 'General',
                caption: options.caption || null
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

    async addVehiclePhoto(vehicleId, file, options = {}) {
        return this.uploadVehiclePhoto(vehicleId, file, options);
    },

    /**
     * Fetches photos for a vehicle.
     */
    async getVehiclePhotos(vehicleId) {
        const { data, error } = await supabase
            .from('vehicle_photos')
            .select('*')
            .eq('vehicle_id', vehicleId)
            .order('sort_order', { ascending: true });

        if (error) throw new Error(error.message);
        return data || [];
    },

    /**
     * Deletes a vehicle photo from storage and database.
     */
    async deleteVehiclePhoto(photoId) {
        const { data: photo, error: fetchError } = await supabase
            .from('vehicle_photos')
            .select('*')
            .eq('id', photoId)
            .single();

        if (fetchError || !photo) throw new Error('Photo not found.');

        if (photo.storage_path) {
            await supabase.storage
                .from('vehicle-photos')
                .remove([photo.storage_path]);
        }

        const { error } = await supabase
            .from('vehicle_photos')
            .delete()
            .eq('id', photoId);

        if (error) throw new Error(error.message);
        return true;
    },

    /**
     * ==========================================
     * PUBLIC DATA ADAPTER (vehicle-details.html)
     * ==========================================
     */

    /**
     * Data Adapter for public vehicle-details.html:
     * Fetches verified vehicle details with explicit public fields, gallery photos, 
     * and completed inspections complete with explicit public findings and evidence photos.
     */
    async getPublicVehicleDetails(vehicleId) {
        if (!vehicleId) throw new Error('Vehicle ID is required.');

        // 1. Fetch Vehicle Record with Explicit Public Fields required by vehicle-details.html
        const { data: vehicle, error: vehicleError } = await supabase
            .from('vehicles')
            .select(`
                id,
                vehicle_code,
                year,
                make,
                model,
                trim,
                mileage,
                engine,
                transmission,
                fuel_type,
                colour,
                body_type,
                location,
                price,
                currency,
                description,
                vin,
                registration_number,
                verification_status,
                verification_reference,
                verified_at
            `)
            .eq('id', vehicleId)
            .single();

        if (vehicleError || !vehicle) return null;

        // 2. Fetch Vehicle Gallery Photos with Explicit Public Fields
        const { data: photos, error: photosError } = await supabase
            .from('vehicle_photos')
            .select(`
                id,
                vehicle_id,
                storage_path,
                public_url,
                category,
                caption,
                sort_order,
                is_primary
            `)
            .eq('vehicle_id', vehicleId)
            .order('is_primary', { ascending: false })
            .order('sort_order', { ascending: true });

        vehicle.photos = (!photosError && photos) ? photos : [];

        // 3. Fetch Completed Inspections with Explicit Public Fields for Findings & Evidence Photos
        const { data: inspections, error: inspError } = await supabase
            .from('inspections')
            .select(`
                id,
                vehicle_id,
                inspection_number,
                inspection_date,
                mileage,
                overall_score,
                mechanical_score,
                electrical_score,
                body_score,
                interior_score,
                suspension_score,
                brake_score,
                diagnostic_score,
                road_test_score,
                overall_condition,
                recommendation,
                summary,
                inspection_status,
                report_path,
                completed_at,
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
                    finding_photos (
                        id,
                        finding_id,
                        public_url,
                        caption,
                        sort_order
                    )
                )
            `)
            .eq('vehicle_id', vehicleId)
            .eq('inspection_status', 'COMPLETED')
            .order('completed_at', { ascending: false });

        if (!inspError && inspections) {
            vehicle.inspections = inspections.map(insp => {
                const mappedFindings = (insp.inspection_findings || []).map(f => {
                    let severityLabel = f.rating;
                    if (f.rating === 'FAIL') {
                        severityLabel = f.severity >= 4 ? 'CRITICAL' : 'MAJOR';
                    } else if (f.rating === 'ATTENTION') {
                        severityLabel = f.severity >= 3 ? 'MODERATE' : 'MINOR';
                    } else {
                        severityLabel = 'NOTE';
                    }

                    return {
                        ...f,
                        category: f.component ? `${f.area} — ${f.component}` : f.area,
                        description: f.finding || 'No details provided.',
                        severity: severityLabel,
                        photos: (f.finding_photos || []).map(fp => ({
                            public_url: fp.public_url,
                            caption: fp.caption
                        }))
                    };
                });

                return {
                    ...insp,
                    findings: mappedFindings
                };
            });
        } else {
            vehicle.inspections = [];
        }

        return vehicle;
    }
};

export const {
    getAllVehicles,
    getAdminVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    updateVehiclePrice,
    verifyVehicle,
    rejectVehicle,
    publishVehicle,
    unpublishVehicle,
    reserveVehicle,
    markAvailable,
    markSold,
    archiveVehicle,
    uploadVehiclePhoto,
    addVehiclePhoto,
    getVehiclePhotos,
    deleteVehiclePhoto,
    getPublicVehicleDetails
} = vehicleService;
