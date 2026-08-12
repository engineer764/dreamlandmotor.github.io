import { supabase } from './supabaseClient.js';

export const vehicleService = {
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

    async getAdminVehicles() {
        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
    },

    async getVehicleById(id) {
        const { data, error } = await supabase
            .from('vehicles')
            .select('*, vehicle_photos(*), inspections(*)')
            .eq('id', id)
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    /**
     * Creates a new vehicle draft securely via database RPC with proper field mapping.
     */
    async createVehicle(vehicleData) {
        const payload = { ...vehicleData };

        const mapField = (camel, snake) => {
            if (payload[camel] !== undefined) {
                payload[snake] = payload[camel];
                delete payload[camel];
            }
        };

        mapField('bodyType', 'body_type');
        mapField('fuelType', 'fuel_type');
        mapField('exteriorColor', 'colour');
        mapField('transmissionType', 'transmission');

        const { data, error } = await supabase.rpc('create_vehicle', { p_data: payload });

        if (error) throw new Error(error.message);
        return data;
    },

    /**
     * Updates an existing vehicle's ordinary details securely via database RPC (excluding price).
     */
    async updateVehicle(id, vehicleData) {
        const payload = { ...vehicleData };

        const mapField = (camel, snake) => {
            if (payload[camel] !== undefined) {
                payload[snake] = payload[camel];
                delete payload[camel];
            }
        };

        mapField('bodyType', 'body_type');
        mapField('fuelType', 'fuel_type');
        mapField('exteriorColor', 'colour');
        mapField('transmissionType', 'transmission');

        const { data, error } = await supabase.rpc('update_vehicle', { 
            p_vehicle_id: id, 
            p_data: payload 
        });

        if (error) throw new Error(error.message);
        return data;
    },

    /**
     * Updates vehicle price through the dedicated secure price-management channel.
     */
    async updateVehiclePrice(id, newPrice) {
        const { error } = await supabase.rpc('update_vehicle_price', { 
            p_vehicle_id: id, 
            p_new_price: newPrice 
        });

        if (error) throw new Error(error.message);
        return true;
    },

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

    async verifyVehicle(id) {
        const { error } = await supabase.rpc('verify_vehicle', { p_vehicle_id: id });
        if (error) throw new Error(error.message);
        return true;
    },

    async rejectVehicle(id, reason) {
        const { error } = await supabase.rpc('reject_vehicle', { 
            p_vehicle_id: id, 
            p_reason: reason || 'Rejected by admin' 
        });
        if (error) throw new Error(error.message);
        return true;
    },

    async publishVehicle(id) {
        const { error } = await supabase.rpc('publish_vehicle', { p_vehicle_id: id });
        if (error) throw new Error(error.message);
        return true;
    },

    async unpublishVehicle(id) {
        const { error } = await supabase.rpc('unpublish_vehicle', { p_vehicle_id: id });
        if (error) throw new Error(error.message);
        return true;
    },

    async reserveVehicle(id) {
        const { error } = await supabase.rpc('reserve_vehicle', { p_vehicle_id: id });
        if (error) throw new Error(error.message);
        return true;
    },

    async markAvailable(id) {
        const { error } = await supabase.rpc('mark_vehicle_available', { p_vehicle_id: id });
        if (error) throw new Error(error.message);
        return true;
    },

    async markSold(id) {
        const { error } = await supabase.rpc('mark_vehicle_sold', { p_vehicle_id: id });
        if (error) throw new Error(error.message);
        return true;
    },

    async archiveVehicle(id) {
        const { error } = await supabase.rpc('archive_vehicle', { p_vehicle_id: id });
        if (error) throw new Error(error.message);
        return true;
    }
};

// --- TOP-LEVEL NAMED EXPORTS ---
export const getVerifiedVehicles = vehicleService.getVerifiedVehicles;
export const getAdminVehicles = vehicleService.getAdminVehicles;
export const getVehicleById = vehicleService.getVehicleById;
export const createVehicle = vehicleService.createVehicle;
export const updateVehicle = vehicleService.updateVehicle;
export const updateVehiclePrice = vehicleService.updateVehiclePrice;
export const addVehiclePhoto = vehicleService.addVehiclePhoto;
export const verifyVehicle = vehicleService.verifyVehicle;
export const rejectVehicle = vehicleService.rejectVehicle;
export const publishVehicle = vehicleService.publishVehicle;
export const unpublishVehicle = vehicleService.unpublishVehicle;
export const reserveVehicle = vehicleService.reserveVehicle;
export const markAvailable = vehicleService.markAvailable;
export const markSold = vehicleService.markSold;
export const archiveVehicle = vehicleService.archiveVehicle;
