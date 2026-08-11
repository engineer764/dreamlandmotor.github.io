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

    /**
     * Automatically maps all frontend camelCase form properties to database snake_case columns.
     */
    async createVehicle(vehicleData) {
        const payload = {
            ...vehicleData,
            verification_status: 'PENDING',
            publication_status: 'UNPUBLISHED',
            sales_status: 'AVAILABLE'
        };

        const mapField = (camel, snake) => {
            if (payload[camel] !== undefined) {
                payload[snake] = payload[camel];
                delete payload[camel];
            }
        };

        // Map all common camelCase fields sent from the form
        mapField('bodyType', 'body_type');
        mapField('fuelType', 'fuel_type');
        mapField('driveType', 'drive_type');
        mapField('engineSize', 'engine_size');
        mapField('exteriorColor', 'exterior_color');
        mapField('interiorColor', 'interior_color');
        mapField('transmissionType', 'transmission_type');

        const { data, error } = await supabase
            .from('vehicles')
            .insert([payload])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
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
        const { error } = await supabase.rpc('verify_vehicle', { vehicle_uuid: id });
        if (error) throw new Error(error.message);
        return true;
    },

    async rejectVehicle(id, reason) {
        const { error } = await supabase.rpc('reject_vehicle', { 
            vehicle_uuid: id, 
            reason: reason || 'Rejected by admin' 
        });
        if (error) throw new Error(error.message);
        return true;
    },

    async publishVehicle(id) {
        const { error } = await supabase.rpc('publish_vehicle', { vehicle_uuid: id });
        if (error) throw new Error(error.message);
        return true;
    },

    async unpublishVehicle(id) {
        const { error } = await supabase.rpc('unpublish_vehicle', { vehicle_uuid: id });
        if (error) throw new Error(error.message);
        return true;
    },

    async reserveVehicle(id) {
        const { error } = await supabase.rpc('reserve_vehicle', { vehicle_uuid: id });
        if (error) throw new Error(error.message);
        return true;
    },

    async markAvailable(id) {
        const { error } = await supabase.rpc('mark_vehicle_available', { vehicle_uuid: id });
        if (error) throw new Error(error.message);
        return true;
    },

    async markSold(id) {
        const { error } = await supabase.rpc('mark_vehicle_sold', { vehicle_uuid: id });
        if (error) throw new Error(error.message);
        return true;
    },

    async archiveVehicle(id) {
        const { error } = await supabase.rpc('archive_vehicle', { vehicle_uuid: id });
        if (error) throw new Error(error.message);
        return true;
    }
};

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
