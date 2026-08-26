import { supabase } from './supabaseClient.js';

export const vehicleService = {
    /**
     * ==========================================
     * ADMIN & INVENTORY MANAGEMENT METHODS
     * ==========================================
     */

    /**
     * Fetches all vehicles for the admin inventory dashboard, 
     * enriching each vehicle record with its latest inspection status.
     */
    async getAdminVehicles() {
        const { data: vehicles, error: vehicleError } = await supabase
            .from('vehicles')
            .select('*')
            .order('created_at', { ascending: false });

        if (vehicleError) {
            throw new Error(vehicleError.message);
        }

        if (!vehicles || vehicles.length === 0) {
            return [];
        }

        const vehicleIds = vehicles.map(v => v.id);

        const { data: inspections, error: inspectionError } = await supabase
            .from('inspections')
            .select(`
                id,
                vehicle_id,
                inspection_status,
                completed_at,
                inspection_date
            `)
            .in('vehicle_id', vehicleIds)
            .order('completed_at', { ascending: false, nullsFirst: false });

        if (inspectionError) {
            throw new Error(inspectionError.message);
        }

        const latestInspectionByVehicle = new Map();

        for (const inspection of inspections || []) {
            if (!latestInspectionByVehicle.has(inspection.vehicle_id)) {
                latestInspectionByVehicle.set(
                    inspection.vehicle_id,
                    inspection
                );
            }
        }

        return vehicles.map(vehicle => {
            const inspection = latestInspectionByVehicle.get(vehicle.id);

            return {
                ...vehicle,
                inspection_status: inspection?.inspection_status || 'DRAFT',
                inspection_id: inspection?.id || null,
                inspection_date: inspection?.inspection_date || null,
                inspection_completed_at: inspection?.completed_at || null
            };
        });
    },

    async getAllVehicles() {
        return this.getAdminVehicles();
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

    async createVehicle(vehicleData) {
        if (!vehicleData || typeof vehicleData !== 'object') {
            throw new Error('Vehicle data is required.');
        }

        const { data, error } = await supabase.rpc('create_vehicle', {
            p_data: vehicleData
        });

        if (error) {
            throw new Error(error.message);
        }

        return Array.isArray(data) ? data[0] : data;
    },

    /**
     * Updates an existing vehicle record securely via database RPC.
     */
    async updateVehicle(vehicleId, updateData) {
        if (!vehicleId) throw new Error('Vehicle ID is required.');
        if (!updateData || typeof updateData !== 'object') {
            throw new Error('Update data is required.');
        }

        const { data, error } = await supabase.rpc('update_vehicle', {
            p_vehicle_id: vehicleId,
            p_data: updateData
        });

        if (error) throw new Error(error.message);
        return Array.isArray(data) ? data[0] : data;
    },

    /**
     * Permanently deletes a vehicle record using the secure atomic database RPC
     * and cleans up associated storage objects from the bucket.
     */
    async deleteVehicle(vehicleId) {
        if (!vehicleId) throw new Error('Vehicle ID is required.');

        // 1. Fetch associated photo storage paths before database cleanup
        const { data: photos, error: photoFetchErr } = await supabase
            .from('vehicle_photos')
            .select('storage_path')
            .eq('vehicle_id', vehicleId);

        if (!photoFetchErr && photos && photos.length > 0) {
            const pathsToRemove = photos.map(p => p.storage_path).filter(Boolean);
            if (pathsToRemove.length > 0) {
                await supabase.storage.from('vehicle-photos').remove(pathsToRemove);
            }
        }

        // 2. Execute atomic database cascade deletion via secure RPC
        const { error: rpcError } = await supabase.rpc('delete_vehicle', {
            p_vehicle_id: vehicleId
        });

        if (rpcError) {
            throw new Error(rpcError.message);
        }

        return true;
    },

    /**
     * ==========================================
     * VEHICLE LIFECYCLE ACTIONS
     * Protected state changes MUST use database RPCs.
     * ==========================================
     */

    async verifyVehicle(vehicleId) {
        if (!vehicleId) {
            throw new Error('Vehicle ID is required.');
        }

        const { data, error } = await supabase.rpc('verify_vehicle', {
            p_vehicle_id: vehicleId
        });

        if (error) throw new Error(error.message);
        return data;
    },

    async rejectVehicle(vehicleId, reason) {
        if (!vehicleId) {
            throw new Error('Vehicle ID is required.');
        }

        const { data, error } = await supabase.rpc('reject_vehicle', {
            p_vehicle_id: vehicleId,
            p_reason: reason || null
        });

        if (error) throw new Error(error.message);
        return data;
    },

    async publishVehicle(vehicleId) {
        if (!vehicleId) {
            throw new Error('Vehicle ID is required.');
        }

        const { data, error } = await supabase.rpc('publish_vehicle', {
            p_vehicle_id: vehicleId
        });

        if (error) throw new Error(error.message);
        return data;
    },

    async unpublishVehicle(vehicleId) {
        if (!vehicleId) {
            throw new Error('Vehicle ID is required.');
        }

        const { data, error } = await supabase.rpc('unpublish_vehicle', {
            p_vehicle_id: vehicleId
        });

        if (error) throw new Error(error.message);
        return data;
    },

    async reserveVehicle(vehicleId) {
        if (!vehicleId) {
            throw new Error('Vehicle ID is required.');
        }

        const { data, error } = await supabase.rpc('reserve_vehicle', {
            p_vehicle_id: vehicleId
        });

        if (error) throw new Error(error.message);
        return data;
    },

    async markAvailable(vehicleId) {
        if (!vehicleId) {
            throw new Error('Vehicle ID is required.');
        }

        const { data, error } = await supabase.rpc('mark_vehicle_available', {
            p_vehicle_id: vehicleId
        });

        if (error) throw new Error(error.message);
        return data;
    },

    async markSold(vehicleId) {
        if (!vehicleId) {
            throw new Error('Vehicle ID is required.');
        }

        const { data, error } = await supabase.rpc('mark_vehicle_sold', {
            p_vehicle_id: vehicleId
        });

        if (error) throw new Error(error.message);
        return data;
    },

    async archiveVehicle(vehicleId) {
        if (!vehicleId) {
            throw new Error('Vehicle ID is required.');
        }

        const { data, error } = await supabase.rpc('archive_vehicle', {
            p_vehicle_id: vehicleId
        });

        if (error) throw new Error(error.message);
        return data;
    },

    /**
     * ==========================================
     * PHOTO MANAGEMENT METHODS
     * ==========================================
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

        const { count } = await supabase
            .from('vehicle_photos')
            .select('*', { count: 'exact', head: true })
            .eq('vehicle_id', vehicleId);

        const isFirstPhoto = (count === 0);
        const isPrimary = options.is_primary || isFirstPhoto;

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
                sort_order: options.sort_order !== undefined ? parseInt(options.sort_order, 10) : (count || 0),
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
     * Fetches photos for a vehicle, ordered by primary first then sort order.
     */
    async getVehiclePhotos(vehicleId) {
        if (!vehicleId) throw new Error('Vehicle ID is required.');
        const { data, error } = await supabase
            .from('vehicle_photos')
            .select('*')
            .eq('vehicle_id', vehicleId)
            .order('is_primary', { ascending: false })
            .order('sort_order', { ascending: true });

        if (error) throw new Error(error.message);
        return data || [];
    },

    /**
     * Sets a specific photo as primary for a vehicle safely without PGRST116 coercion errors.
     */
    async setPrimaryPhoto(vehicleId, photoId) {
        if (!vehicleId || !photoId) {
            throw new Error('Vehicle ID and Photo ID are required.');
        }

        const { error: resetError } = await supabase
            .from('vehicle_photos')
            .update({ is_primary: false })
            .eq('vehicle_id', vehicleId);

        if (resetError) {
            throw new Error(`Failed to reset primary status: ${resetError.message}`);
        }

        const { data, error: setPrimaryError } = await supabase
            .from('vehicle_photos')
            .update({ is_primary: true })
            .eq('id', photoId)
            .eq('vehicle_id', vehicleId)
            .select();

        if (setPrimaryError) {
            throw new Error(`Failed to set primary photo: ${setPrimaryError.message}`);
        }

        if (!data || data.length === 0) {
            throw new Error('Photo not found or update unauthorized by RLS policies.');
        }

        return data[0];
    },

    /**
     * Deletes a vehicle photo from storage and database, promoting another photo if primary was deleted.
     */
    async deleteVehiclePhoto(photoId) {
        if (!photoId) throw new Error('Photo ID is required.');

        const { data: photo, error: fetchError } = await supabase
            .from('vehicle_photos')
            .select('*')
            .eq('id', photoId)
            .single();

        if (fetchError || !photo) throw new Error('Photo not found.');

        const vehicleId = photo.vehicle_id;
        const wasPrimary = photo.is_primary;

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

        if (wasPrimary && vehicleId) {
            const { data: remainingPhotos } = await supabase
                .from('vehicle_photos')
                .select('*')
                .eq('vehicle_id', vehicleId)
                .order('sort_order', { ascending: true })
                .limit(1);

            if (remainingPhotos && remainingPhotos.length > 0) {
                await supabase
                    .from('vehicle_photos')
                    .update({ is_primary: true })
                    .eq('id', remainingPhotos[0].id);
            }
        }

        return true;
    },

  /**
     * Uploads an inspection PDF report (main or scanner health report) to storage 
     * and updates the existing vehicle inspection record cleanly without duplicates.
     */
    async uploadInspectionReportPdf(vehicleId, file, reportType = 'scanner') {
        if (!file || !(file instanceof File)) {
            throw new Error('A valid PDF file is required.');
        }

        const fileExt = file.name.split('.').pop().toLowerCase();
        if (fileExt !== 'pdf') {
            throw new Error('Only PDF files are allowed for inspection reports.');
        }

        const fileName = `inspections/${vehicleId}/${reportType}_${Math.random().toString(36).substring(2, 10)}.pdf`;

        // 1. Upload to Supabase Storage bucket ('vehicle-photos')
        const { error: uploadError } = await supabase.storage
            .from('vehicle-photos')
            .upload(fileName, file, { upsert: true });

        if (uploadError) throw new Error(uploadError.message);

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('vehicle-photos')
            .getPublicUrl(fileName);

        // 3. Find the existing inspection record for this vehicle
        let { data: existingInspections, error: fetchErr } = await supabase
            .from('inspections')
            .select('id')
            .eq('vehicle_id', vehicleId)
            .order('created_at', { ascending: false })
            .limit(1);

        let targetInspectionId;

        if (fetchErr || !existingInspections || existingInspections.length === 0) {
            // Only create if no inspection record exists at all, using 'DRAFT'
            const { data: newInsp, error: createErr } = await supabase
                .from('inspections')
                .insert([{ vehicle_id: vehicleId, inspection_status: 'DRAFT' }])
                .select('id')
                .single();
            
            if (createErr) throw new Error(`Failed to initialize inspection record: ${createErr.message}`);
            targetInspectionId = newInsp.id;
        } else {
            // Use the existing inspection record ID to prevent duplicates
            targetInspectionId = existingInspections[0].id;
        }

        // 4. Update the exact existing inspection record with the new PDF report path
        const updateField = reportType === 'scanner' ? 'scanner_report_path' : 'report_path';
        
        const { error: updateErr } = await supabase
            .from('inspections')
            .update({ [updateField]: publicUrl })
            .eq('id', targetInspectionId);

        if (updateErr) throw new Error(`Failed to save report link: ${updateErr.message}`);

        return publicUrl;
    },

    /**
     * ==========================================
     * PUBLIC DATA ADAPTERS & LISTINGS
     * ==========================================
     */

    async getVerifiedVehicles(filters = {}) {
        let query = supabase
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
                verification_status,
                publication_status,
                verification_reference,
                verified_at
            `)
            .eq('verification_status', 'VERIFIED')
            .eq('publication_status', 'PUBLISHED');

        if (filters.location && filters.location.trim() !== '') {
            query = query.eq('location', filters.location.trim());
        }

        if (filters.search && filters.search.trim() !== '') {
            const term = `%${filters.search.trim()}%`;
            query = query.or(`make.ilike.${term},model.ilike.${term},trim.ilike.${term},vehicle_code.ilike.${term}`);
        }

        const { data: vehicles, error: vehicleError } = await query.order('created_at', { ascending: false });

        if (vehicleError) {
            throw new Error(vehicleError.message);
        }

        if (!vehicles || vehicles.length === 0) {
            return [];
        }

        const vehicleIds = vehicles.map(vehicle => vehicle.id);

        const { data: photos, error: photoError } = await supabase
            .from('vehicle_photos')
            .select(`
                id,
                vehicle_id,
                storage_path,
                public_url,
                is_primary,
                sort_order,
                category,
                caption
            `)
            .in('vehicle_id', vehicleIds)
            .order('sort_order', { ascending: true });

        if (photoError) {
            throw new Error(photoError.message);
        }

        const photosByVehicle = new Map();

        for (const photo of photos || []) {
            if (!photo.vehicle_id || !photo.public_url) {
                continue;
            }

            if (!photosByVehicle.has(photo.vehicle_id)) {
                photosByVehicle.set(photo.vehicle_id, []);
            }

            photosByVehicle.get(photo.vehicle_id).push(photo);
        }

        return vehicles.map(vehicle => {
            const vehiclePhotos = photosByVehicle.get(vehicle.id) || [];

            const primaryPhoto =
                vehiclePhotos.find(
                    photo => photo.is_primary === true && photo.public_url
                ) ||
                vehiclePhotos.find(
                    photo => photo.public_url
                ) ||
                null;

            return {
                ...vehicle,
                photos: vehiclePhotos,
                primary_photo_url: primaryPhoto?.public_url || null,
                primary_photo_id: primaryPhoto?.id || null
            };
        });
    },

    /**
     * ==========================================
     * PUBLIC DATA ADAPTER (vehicle-details.html)
     * ==========================================
     */
    async getPublicVehicleDetails(vehicleId) {
        if (!vehicleId) throw new Error('Vehicle ID is required.');

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
                scanner_report_path,
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
                    if (f.rating === 'CRITICAL') {
                        severityLabel = f.is_safety_critical ? 'CRITICAL SAFETY' : 'CRITICAL';
                    } else if (f.rating === 'ATTENTION') {
                        severityLabel = f.severity >= 3 ? 'MODERATE' : 'MINOR';
                    } else if (f.rating === 'FAIR') {
                        severityLabel = 'FAIR';
                    } else {
                        severityLabel = 'GOOD';
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
    deleteVehicle,
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
    setPrimaryPhoto,
    deleteVehiclePhoto,
    getVerifiedVehicles,
    getPublicVehicleDetails,
    uploadInspectionReportPdf
} = vehicleService;
