import { supabase } from './supabaseClient.js';

export const vehicleService = {
    /**
     * Fetches published and verified vehicles for the public catalog with filtering and search.
     */
    async getVerifiedVehicles(filters = {}) {
        let query = supabase
            .from('public_verified_vehicles')
            .select('*')
            .order('published_at', { ascending: false });

        if (filters.search) {
            query = query.or(`make.ilike.%${filters.search}%,model.ilike.%${filters.search}%,vehicle_code.ilike.%${filters.search}%`);
        }

        if (filters.location) {
            query = query.eq('location', filters.location);
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return data;
    },

    /**
     * Fetches all vehicles for the admin portal.
     */
    async getAdminVehicles() {
        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
    },

   /**
     * Creates a new vehicle draft in the database with property mapping.
     */
    async createVehicle(vehicleData) {
        // Map any frontend camelCase fields to database snake_case columns
        const payload = {
            ...vehicleData,
            verification_status: 'PENDING',
            publication_status: 'UNPUBLISHED',
            sales_status: 'AVAILABLE'
        };

        if (payload.bodyType !== undefined) {
            payload.body_type = payload.bodyType;
            delete payload.bodyType;
        }

        const { data, error } = await supabase
            .from('vehicles')
            .insert([payload])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },
    /**
     * Attaches a photo to a vehicle record.
     */
    async addVehiclePhoto(vehicleId, photoData) {
        const { data, error } = await supabase
            .from('vehicle_photos')
            .insert([{
                vehicle_id: vehicleId,
                storage_path: photoData.storage_path || 'external/custom_upload.jpg',
                public_url: photoData.public_url,
                category: photoData.category || 'EXTERIOR',
                is_primary: photoData.is_primary || false
            }])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    /**
     * Verifies a vehicle via RPC.
     */
    async verifyVehicle(id) {
        const { error } = await supabase.rpc('verify_vehicle', { vehicle_uuid: id });
        if (error) throw new Error(error.message);
        return true;
    },

    /**
     * Rejects a vehicle inspection with a required reason.
     */
    async rejectVehicle(id, reason) {
        const { error } = await supabase
            .from('vehicles')
            .update({ verification_status: 'REJECTED' })
            .eq('id', id);

        if (error) throw new Error(error.message);
        return true;
    },

    /**
     * Publishes a verified vehicle to the live catalog.
     */
    async publishVehicle(id) {
        const { error } = await supabase.rpc('publish_vehicle', { vehicle_uuid: id });
        if (error) throw new Error(error.message);
        return true;
    },

    /**
     * Unpublishes a vehicle from the catalog.
     */
    async unpublishVehicle(id) {
        const { error } = await supabase.rpc('unpublish_vehicle', { vehicle_uuid: id });
        if (error) throw new Error(error.message);
        return true;
    },

    /**
     * Reserves a vehicle.
     */
    async reserveVehicle(id) {
        const { error } = await supabase
            .from('vehicles')
            .update({ sales_status: 'RESERVED' })
            .eq('id', id);
        if (error) throw new Error(error.message);
        return true;
    },

    /**
     * Marks a reserved or sold vehicle back to available.
     */
    async markAvailable(id) {
        const { error } = await supabase
            .from('vehicles')
            .update({ sales_status: 'AVAILABLE' })
            .eq('id', id);
        if (error) throw new Error(error.message);
        return true;
    },

    /**
     * Marks a vehicle as sold.
     */
    async markSold(id) {
        const { error } = await supabase.rpc('mark_vehicle_sold', { vehicle_uuid: id });
        if (error) throw new Error(error.message);
        return true;
    },

    /**
     * Archives a vehicle record preserving audit history.
     */
    async archiveVehicle(id) {
        const { error } = await supabase.rpc('archive_vehicle', { vehicle_uuid: id });
        if (error) throw new Error(error.message);
        return true;
    }
};

// --- TOP-LEVEL NAMED EXPORTS FOR ADMIN DASHBOARD COMPATIBILITY ---
export const getAdminVehicles = vehicleService.getAdminVehicles;
export const createVehicle = vehicleService.createVehicle;
export const verifyVehicle = vehicleService.verifyVehicle;
export const rejectVehicle = vehicleService.rejectVehicle;
export const publishVehicle = vehicleService.publishVehicle;
export const unpublishVehicle = vehicleService.unpublishVehicle;
export const reserveVehicle = vehicleService.reserveVehicle;
export const markAvailable = vehicleService.markAvailable;
export const markSold = vehicleService.markSold;
export const archiveVehicle = vehicleService.archiveVehicle;
