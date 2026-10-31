import { supabase } from './supabaseClient.js';

export const vehicleService = {
    /**
     * ==========================================
     * ADMIN & INVENTORY MANAGEMENT METHODS
     * ==========================================
     */

    /**
     * Fetches all vehicles for the admin inventory dashboard, 
     * enforcing strict authoritative verification inspection selection and ownership validation.
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

        // 1. Collect explicit authoritative inspection IDs where verification_inspection_id is set
        const authoritativeInspectionIds = vehicles
            .map(v => v.verification_inspection_id)
            .filter(Boolean);

        const inspectionMap = new Map();

        if (authoritativeInspectionIds.length > 0) {
            const { data: authInspections, error: authError } = await supabase
                .from('inspections')
                .select(`
                    id,
                    vehicle_id,
                    inspection_status,
                    completed_at,
                    inspection_date
                `)
                .in('id', authoritativeInspectionIds);

            if (authError) {
                throw new Error(`Failed to retrieve authoritative verification inspections: ${authError.message}`);
            }

            if (authInspections) {
                for (const insp of authInspections) {
                    // Strict Ownership Validation: Verify inspection belongs to the claiming vehicle
                    const matchingVehicle = vehicles.find(v => v.verification_inspection_id === insp.id);
                    if (matchingVehicle && insp.vehicle_id !== matchingVehicle.id) {
                        throw new Error(`Security validation failed: Authoritative inspection ${insp.id} does not belong to vehicle ${matchingVehicle.id}.`);
                    }
                    inspectionMap.set(insp.id, insp);
                }
            }
        }

        // 2. Fallback query for legacy vehicles lacking an explicit verification_inspection_id pointer with explicit error handling
        const legacyVehicleIds = vehicles
            .filter(v => !v.verification_inspection_id)
            .map(v => v.id);

        if (legacyVehicleIds.length > 0) {
            const { data: legacyInspections, error: legacyError } = await supabase
                .from('inspections')
                .select(`
                    id,
                    vehicle_id,
                    inspection_status,
                    completed_at,
                    inspection_date
                `)
                .in('vehicle_id', legacyVehicleIds)
                .eq('inspection_status', 'COMPLETED')
                .order('completed_at', { ascending: false, nullsFirst: false });

            if (legacyError) {
                throw new Error(`Failed to retrieve legacy inspection records: ${legacyError.message}`);
            }

            if (legacyInspections) {
                for (const inspection of legacyInspections) {
                    if (inspection.vehicle_id && !Array.from(inspectionMap.values()).some(i => i.vehicle_id === inspection.vehicle_id)) {
                        inspectionMap.set(inspection.id, inspection);
                    }
                }
            }
        }

        return vehicles.map(vehicle => {
            let inspection = null;

            if (vehicle.verification_inspection_id) {
                inspection = inspectionMap.get(vehicle.verification_inspection_id) || null;
            } else {
                inspection = Array.from(inspectionMap.values()).find(i => i.vehicle_id === vehicle.id) || null;
            }

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

        if (error) throw new Error(error.message);
        return Array.isArray(data) ? data[0] : data;
    },

    async updateVehicle(vehicleId, updateData) {
        if (!vehicleId) throw new Error('Vehicle ID is required for update.');

        const { data: updatedVehicle, error: rpcError } = await supabase
            .rpc('update_vehicle', {
                p_vehicle_id: vehicleId,
                p_data: updateData
            });

        if (rpcError) throw new Error(`Failed to update vehicle: ${rpcError.message}`);

        if (updateData.mileage !== undefined && updateData.mileage !== null) {
            const mileage = Number(updateData.mileage);
            if (!Number.isFinite(mileage) || mileage < 0) {
                throw new Error('Mileage must be a valid non-negative number.');
            }

            const { data: vehicleRecord, error: fetchErr } = await supabase
                .from('vehicles')
                .select('verification_inspection_id')
                .eq('id', vehicleId)
                .single();

            if (fetchErr) throw new Error(`Vehicle updated, but authoritative inspection could not be determined: ${fetchErr.message}`);

            if (vehicleRecord?.verification_inspection_id) {
                const { error: inspectionUpdateError } = await supabase
                    .from('inspections')
                    .update({ mileage, updated_at: new Date().toISOString() })
                    .eq('id', vehicleRecord.verification_inspection_id);

                if (inspectionUpdateError) {
                    throw new Error(`Vehicle updated, but inspection mileage could not be synchronized: ${inspectionUpdateError.message}`);
                }
            }
        }

        return Array.isArray(updatedVehicle) ? updatedVehicle[0] : updatedVehicle;
    },

    /**
     * ==========================================
     * VEHICLE LIFECYCLE ACTIONS
     * ==========================================
     */

    async verifyVehicle(vehicleId) {
        if (!vehicleId) throw new Error('Vehicle ID is required.');
        const { data, error } = await supabase.rpc('verify_vehicle', { p_vehicle_id: vehicleId });
        if (error) throw new Error(error.message);
        return data;
    },

    async rejectVehicle(vehicleId, reason) {
        if (!vehicleId) throw new Error('Vehicle ID is required.');
        const { data, error } = await supabase.rpc('reject_vehicle', { p_vehicle_id: vehicleId, p_reason: reason || null });
        if (error) throw new Error(error.message);
        return data;
    },

    async publishVehicle(vehicleId) {
        if (!vehicleId) throw new Error('Vehicle ID is required.');
        const { data, error } = await supabase.rpc('publish_vehicle', { p_vehicle_id: vehicleId });
        if (error) throw new Error(error.message);
        return data;
    },

    async publishVerifiedVehicle(vehicleId, inspectionId) {
        if (!vehicleId || !inspectionId) throw new Error('Vehicle ID and Inspection ID are required.');

        const { data, error } = await supabase.rpc('publish_verified_vehicle', {
            p_vehicle_id: vehicleId,
            p_inspection_id: inspectionId
        });

        if (error) throw new Error(error.message);

        // Confirm database state post-publication
        const { data: vehicleCheck, error: checkError } = await supabase
            .from('vehicles')
            .select('publication_status')
            .eq('id', vehicleId)
            .single();

        if (checkError || !vehicleCheck || vehicleCheck.publication_status !== 'PUBLISHED') {
            throw new Error('Publication verification failed: Database confirmed publication_status is not PUBLISHED.');
        }

        return data;
    },

    async unpublishVehicle(vehicleId) {
        if (!vehicleId) throw new Error('Vehicle ID is required.');
        const { data, error } = await supabase.rpc('unpublish_vehicle', { p_vehicle_id: vehicleId });
        if (error) throw new Error(error.message);
        return data;
    },

    async reserveVehicle(vehicleId) {
        if (!vehicleId) throw new Error('Vehicle ID is required.');
        const { data, error } = await supabase.rpc('reserve_vehicle', { p_vehicle_id: vehicleId });
        if (error) throw new Error(error.message);
        return data;
    },

    async markAvailable(vehicleId) {
        if (!vehicleId) throw new Error('Vehicle ID is required.');
        const { data, error } = await supabase.rpc('mark_vehicle_available', { p_vehicle_id: vehicleId });
        if (error) throw new Error(error.message);
        return data;
    },

    async markSold(vehicleId) {
        if (!vehicleId) throw new Error('Vehicle ID is required.');
        const { data, error } = await supabase.rpc('mark_vehicle_sold', { p_vehicle_id: vehicleId });
        if (error) throw new Error(error.message);
        return data;
    },

    async archiveVehicle(vehicleId) {
        if (!vehicleId) throw new Error('Vehicle ID is required.');
        const { data, error } = await supabase.rpc('archive_vehicle', { p_vehicle_id: vehicleId });
        if (error) throw new Error(error.message);
        return data;
    },

    /**
     * ==========================================
     * PHOTO & REPORT MANAGEMENT
     * ==========================================
     */

    async uploadVehiclePhoto(vehicleId, file, options = {}) {
        if (!file || !(file instanceof File)) throw new Error('A valid file is required.');

        const fileExt = file.name.split('.').pop();
        const fileName = `inventory/${vehicleId}/${Math.random().toString(36).substring(2, 10)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage.from('vehicle-photos').upload(fileName, file);
        if (uploadError) throw new Error(uploadError.message);

        const { data: { publicUrl } } = supabase.storage.from('vehicle-photos').getPublicUrl(fileName);

        const { count } = await supabase.from('vehicle_photos').select('*', { count: 'exact', head: true }).eq('vehicle_id', vehicleId);
        const isFirstPhoto = (count === 0);
        const isPrimary = options.is_primary || isFirstPhoto;

        if (isPrimary) {
            await supabase.from('vehicle_photos').update({ is_primary: false }).eq('vehicle_id', vehicleId);
        }

        const { data, error } = await supabase.from('vehicle_photos').insert([{
            vehicle_id: vehicleId,
            storage_path: fileName,
            public_url: publicUrl,
            is_primary: isPrimary,
            sort_order: options.sort_order !== undefined ? parseInt(options.sort_order, 10) : (count || 0),
            category: options.category || 'General',
            caption: options.caption || null
        }]).select().single();

        if (error) {
            await supabase.storage.from('vehicle-photos').remove([fileName]);
            throw new Error(error.message);
        }

        return data;
    },

    async addVehiclePhoto(vehicleId, file, options = {}) {
        return this.uploadVehiclePhoto(vehicleId, file, options);
    },

    async getVehiclePhotos(vehicleId) {
        if (!vehicleId) throw new Error('Vehicle ID is required.');
        const { data, error } = await supabase.from('vehicle_photos').select('*').eq('vehicle_id', vehicleId).order('is_primary', { ascending: false }).order('sort_order', { ascending: true });
        if (error) throw new Error(error.message);
        return data || [];
    },

    async setPrimaryPhoto(vehicleId, photoId) {
        if (!vehicleId || !photoId) throw new Error('Vehicle ID and Photo ID are required.');

        const { error: resetError } = await supabase.from('vehicle_photos').update({ is_primary: false }).eq('vehicle_id', vehicleId);
        if (resetError) throw new Error(`Failed to reset primary status: ${resetError.message}`);

        const { data, error: setPrimaryError } = await supabase.from('vehicle_photos').update({ is_primary: true }).eq('id', photoId).eq('vehicle_id', vehicleId).select();
        if (setPrimaryError) throw new Error(`Failed to set primary photo: ${setPrimaryError.message}`);
        if (!data || data.length === 0) throw new Error('Photo not found or update unauthorized.');

        return data[0];
    },

    async deleteVehiclePhoto(photoId) {
        if (!photoId) throw new Error('Photo ID is required.');

        const { data: photo, error: fetchError } = await supabase.from('vehicle_photos').select('*').eq('id', photoId).single();
        if (fetchError || !photo) throw new Error('Photo not found.');

        const vehicleId = photo.vehicle_id;
        const wasPrimary = photo.is_primary;

        if (photo.storage_path) {
            await supabase.storage.from('vehicle-photos').remove([photo.storage_path]);
        }

        const { error } = await supabase.from('vehicle_photos').delete().eq('id', photoId);
        if (error) throw new Error(error.message);

        if (wasPrimary && vehicleId) {
            const { data: remainingPhotos } = await supabase.from('vehicle_photos').select('*').eq('vehicle_id', vehicleId).order('sort_order', { ascending: true }).limit(1);
            if (remainingPhotos && remainingPhotos.length > 0) {
                await supabase.from('vehicle_photos').update({ is_primary: true }).eq('id', remainingPhotos[0].id);
            }
        }

        return true;
    },

    async uploadInspectionReportPdf(vehicleId, file, reportType = 'scanner') {
        if (!vehicleId) throw new Error('Vehicle ID is required.');
        if (!file || !(file instanceof File)) throw new Error('A valid PDF file is required.');

        const fileExt = file.name.split('.').pop().toLowerCase();
        if (fileExt !== 'pdf') throw new Error('Only PDF files are allowed for inspection reports.');

        const fileName = `inspections/${vehicleId}/${reportType}_${crypto.randomUUID()}.pdf`;

        const { error: uploadError } = await supabase.storage.from('vehicle-photos').upload(fileName, file, { upsert: false, contentType: 'application/pdf' });
        if (uploadError) throw new Error(`Failed to upload inspection report: ${uploadError.message}`);

        const { data: { publicUrl } } = supabase.storage.from('vehicle-photos').getPublicUrl(fileName);

        const { data: vehicleRecord, error: vehicleErr } = await supabase.from('vehicles').select('verification_inspection_id').eq('id', vehicleId).single();
        if (vehicleErr || !vehicleRecord || !vehicleRecord.verification_inspection_id) {
            await supabase.storage.from('vehicle-photos').remove([fileName]);
            throw new Error('No verified inspection relationship exists for this vehicle.');
        }

        const inspectionId = vehicleRecord.verification_inspection_id;
        const updateField = reportType === 'scanner' ? 'scanner_report_path' : 'report_path';

        const { error: updateError } = await supabase.from('inspections').update({ [updateField]: publicUrl }).eq('id', inspectionId);
        if (updateError) {
            await supabase.storage.from('vehicle-photos').remove([fileName]);
            throw new Error(`Failed to save inspection report link: ${updateError.message}`);
        }

        return publicUrl;
    },

    /**
     * ==========================================
     * PUBLIC DATA ADAPTERS
     * ==========================================
     */

    async getVerifiedVehicles(filters = {}) {
        let query = supabase
            .from('vehicles')
            .select(`id, vehicle_code, year, make, model, trim, mileage, engine, transmission, fuel_type, colour, body_type, location, price, currency, description, verification_status, publication_status, verification_reference, verified_at`)
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
        if (vehicleError) throw new Error(vehicleError.message);
        if (!vehicles || vehicles.length === 0) return [];

        const vehicleIds = vehicles.map(vehicle => vehicle.id);
        const { data: photos, error: photoError } = await supabase.from('vehicle_photos').select(`id, vehicle_id, storage_path, public_url, is_primary, sort_order, category, caption`).in('vehicle_id', vehicleIds).order('sort_order', { ascending: true });
        if (photoError) throw new Error(photoError.message);

        const photosByVehicle = new Map();
        for (const photo of photos || []) {
            if (!photo.vehicle_id || !photo.public_url) continue;
            if (!photosByVehicle.has(photo.vehicle_id)) photosByVehicle.set(photo.vehicle_id, []);
            photosByVehicle.get(photo.vehicle_id).push(photo);
        }

        return vehicles.map(vehicle => {
            const vehiclePhotos = photosByVehicle.get(vehicle.id) || [];
            const primaryPhoto = vehiclePhotos.find(p => p.is_primary === true && p.public_url) || vehiclePhotos.find(p => p.public_url) || null;
            return {
                ...vehicle,
                photos: vehiclePhotos,
                primary_photo_url: primaryPhoto?.public_url || null,
                primary_photo_id: primaryPhoto?.id || null
            };
        });
    },

    async getPublicVehicleDetails(vehicleId) {
        if (!vehicleId) throw new Error('Vehicle ID is required.');

        const { data: vehicle, error: vehicleError } = await supabase
            .from('vehicles')
            .select(`id, vehicle_code, year, make, model, trim, mileage, engine, transmission, fuel_type, colour, body_type, location, price, currency, description, vin, registration_number, verification_status, publication_status, verification_reference, verified_at, verification_inspection_id`)
            .eq('id', vehicleId)
            .eq('verification_status', 'VERIFIED')
            .eq('publication_status', 'PUBLISHED')
            .single();

        if (vehicleError || !vehicle) return null;

        const { data: photos, error: photosError } = await supabase.from('vehicle_photos').select(`id, vehicle_id, storage_path, public_url, category, caption, sort_order, is_primary`).eq('vehicle_id', vehicleId).order('is_primary', { ascending: false }).order('sort_order', { ascending: true });
        vehicle.photos = (!photosError && photos) ? photos : [];

        if (vehicle.verification_inspection_id) {
            const { data: inspection, error: inspError } = await supabase
                .from('inspections')
                .select(`id, vehicle_id, inspection_number, inspection_date, mileage, overall_score, mechanical_score, electrical_score, body_score, interior_score, suspension_score, brake_score, diagnostic_score, road_test_score, overall_condition, recommendation, summary, inspection_status, report_path, scanner_report_path, completed_at, inspection_items(*), inspection_findings(*, finding_photos(*))`)
                .eq('id', vehicle.verification_inspection_id)
                .eq('inspection_status', 'COMPLETED')
                .single();

            if (!inspError && inspection) {
                vehicle.inspections = [inspection];
                vehicle.inspection = inspection;
            } else {
                vehicle.inspections = [];
                vehicle.inspection = null;
            }
        } else {
            vehicle.inspections = [];
            vehicle.inspection = null;
        }

        return vehicle;
    }
};
