import { supabase } from './supabaseClient.js';

// ==========================================
// PRIVATE VALIDATION & HELPER UTILITIES
// ==========================================

const hasValue = (value) => value !== undefined && value !== null && value !== '';

const toFiniteNumber = (value, fieldName) => {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`Invalid ${fieldName}.`);
  }
  return number;
};

const toFiniteInteger = (value, fieldName) => {
  const number = Number(value);
  if (!Number.isInteger(number)) {
    throw new Error(`Invalid ${fieldName}. Must be a whole number.`);
  }
  return number;
};

export const vehicleService = {
  // ==========================================
  // PUBLIC-FACING CATALOG (Masked Views & Filters)
  // ==========================================
  
  async getVerifiedVehicles(filters = {}) {
    let query = supabase
      .from('public_verified_vehicles')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.make) query = query.ilike('make', `%${filters.make}%`);
    if (filters.model) query = query.ilike('model', `%${filters.model}%`);
    if (filters.location) query = query.eq('location', filters.location);
    
    // Price range bounds and safety validation
    const minPrice = hasValue(filters.minPrice) ? toFiniteNumber(filters.minPrice, 'minimum price') : null;
    const maxPrice = hasValue(filters.maxPrice) ? toFiniteNumber(filters.maxPrice, 'maximum price') : null;

    if (minPrice !== null && minPrice < 0) throw new Error('Minimum price cannot be negative.');
    if (maxPrice !== null && maxPrice < 0) throw new Error('Maximum price cannot be negative.');
    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
      throw new Error('Minimum price cannot exceed maximum price.');
    }

    if (minPrice !== null) query = query.gte('price', minPrice);
    if (maxPrice !== null) query = query.lte('price', maxPrice);

    if (hasValue(filters.year)) {
      query = query.eq('year', toFiniteInteger(filters.year, 'manufacturing year'));
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getPublicVehicleDetails(vehicleId) {
    if (!vehicleId) throw new Error('A valid vehicle identifier is required.');

    // 1. Fetch core verified vehicle record
    const { data: vehicle, error: vError } = await supabase
      .from('public_verified_vehicles')
      .select('*')
      .eq('id', vehicleId)
      .single();
    
    if (vError) {
      if (vError.code === 'PGRST116') {
        throw new Error('This vehicle is no longer available or verification has expired.');
      }
      throw vError;
    }

    // 2. Fetch marketing photos with deterministic sorting
    const { data: photos, error: pError } = await supabase
      .from('public_vehicle_photos')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('sort_order', { ascending: true });
    if (pError) throw pError;

    // 3. Fetch the official verification inspection (with fallback ordering)
    let inspectionQuery = supabase
      .from('public_vehicle_inspections')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('inspection_date', { ascending: false });

    if (vehicle.verification_inspection_id) {
      inspectionQuery = inspectionQuery.eq('id', vehicle.verification_inspection_id);
    } else {
      inspectionQuery = inspectionQuery.limit(1);
    }

    const { data: inspections, error: iError } = await inspectionQuery;
    if (iError) throw iError;

    let enrichedInspections = [];
    if (inspections && inspections.length > 0) {
      const inspectionIds = inspections.map(i => i.id);

      // Fetch findings ordered deterministically by severity (highest impact first)
      const { data: findings, error: fError } = await supabase
        .from('public_inspection_findings')
        .select('*')
        .in('inspection_id', inspectionIds)
        .order('severity', { ascending: false });
      if (fError) throw fError;

      let enrichedFindings = [];
      if (findings && findings.length > 0) {
        const findingIds = findings.map(f => f.id);

        // Fetch finding photos with deterministic sort order
        const { data: findingPhotos, error: fpError } = await supabase
          .from('public_finding_photos')
          .select('*')
          .in('finding_id', findingIds)
          .order('sort_order', { ascending: true });
        if (fpError) throw fpError;

        const photosByFindingId = (findingPhotos || []).reduce((acc, photo) => {
          if (!acc[photo.finding_id]) acc[photo.finding_id] = [];
          acc[photo.finding_id].push(photo);
          return acc;
        }, {});

        enrichedFindings = findings.map(finding => ({
          ...finding,
          photos: photosByFindingId[finding.id] || []
        }));
      }

      const findingsByInspectionId = enrichedFindings.reduce((acc, finding) => {
        if (!acc[finding.inspection_id]) acc[finding.inspection_id] = [];
        acc[finding.inspection_id].push(finding);
        return acc;
      }, {});

      enrichedInspections = inspections.map(inspection => ({
        ...inspection,
        findings: findingsByInspectionId[inspection.id] || []
      }));
    }

    return { 
      ...vehicle, 
      photos: photos || [], 
      inspections: enrichedInspections 
    };
  },

  // ==========================================
  // ADMIN & STAFF MANAGEMENT
  // ==========================================

  async getAdminVehicles() {
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        id, vehicle_code, verification_reference, make, model, trim, year, 
        mileage, location, price, currency, sales_status, verification_status, 
        publication_status, created_at,
        vehicle_photos(public_url, is_primary)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createVehicle(vehicleData) {
    if (!vehicleData.make?.trim()) throw new Error('Vehicle make is required.');
    if (!vehicleData.model?.trim()) throw new Error('Vehicle model is required.');
    if (!vehicleData.engine?.trim()) throw new Error('Vehicle engine specification is required.');
    if (!vehicleData.transmission?.trim()) throw new Error('Transmission type is required.');
    if (!vehicleData.fuel_type?.trim()) throw new Error('Fuel type is required.');
    if (!vehicleData.colour?.trim()) throw new Error('Vehicle colour is required.');
    if (!vehicleData.location?.trim()) throw new Error('Vehicle storage/workshop location is required.');
    
    const year = toFiniteInteger(vehicleData.year, 'manufacturing year');
    if (year < 1900 || year > new Date().getFullYear() + 1) {
      throw new Error('Please enter a valid manufacturing year.');
    }

    const mileage = toFiniteInteger(vehicleData.mileage, 'mileage');
    if (mileage < 0) {
      throw new Error('Mileage cannot be negative.');
    }

    const price = toFiniteNumber(vehicleData.price, 'price');
    if (price <= 0) {
      throw new Error('Price must be greater than zero.');
    }

    // Call authoritative database RPC
    const { data, error } = await supabase.rpc('create_vehicle', {
      p_make: vehicleData.make.trim(),
      p_model: vehicleData.model.trim(),
      p_trim: vehicleData.trim?.trim() || null,
      p_year: year,
      p_mileage: mileage,
      p_engine: vehicleData.engine.trim(),
      p_transmission: vehicleData.transmission.trim(),
      p_fuel_type: vehicleData.fuel_type.trim(),
      p_colour: vehicleData.colour.trim(),
      p_body_type: vehicleData.body_type?.trim() || null,
      p_vin: vehicleData.vin?.trim() || null,
      p_registration_number: vehicleData.registration_number?.trim() || null,
      p_location: vehicleData.location.trim(),
      p_price: price,
      p_currency: vehicleData.currency || 'NGN',
      p_description: vehicleData.description?.trim() || null
    });
    
    if (error) throw error;
    return data;
  },

  // ==========================================
  // SECURE STATE-TRANSITION RPC WRAPPERS
  // ==========================================

  async verifyVehicle(vehicleId) {
    const { data, error } = await supabase.rpc('verify_vehicle', { p_vehicle_id: vehicleId });
    if (error) throw error;
    return data;
  },

  async rejectVehicle(vehicleId, reason) {
    if (!reason?.trim()) throw new Error('A rejection reason is required.');
    const { data, error } = await supabase.rpc('reject_vehicle', { p_vehicle_id: vehicleId, p_reason: reason.trim() });
    if (error) throw error;
    return data;
  },

  async publishVehicle(vehicleId) {
    const { data, error } = await supabase.rpc('publish_vehicle', { p_vehicle_id: vehicleId });
    if (error) throw error;
    return data;
  },

  async unpublishVehicle(vehicleId) {
    const { data, error } = await supabase.rpc('unpublish_vehicle', { p_vehicle_id: vehicleId });
    if (error) throw error;
    return data;
  },

  async reserveVehicle(vehicleId) {
    const { data, error } = await supabase.rpc('reserve_vehicle', { p_vehicle_id: vehicleId });
    if (error) throw error;
    return data;
  },

  async markAvailable(vehicleId) {
    const { data, error } = await supabase.rpc('mark_vehicle_available', { p_vehicle_id: vehicleId });
    if (error) throw error;
    return data;
  },

  async markSold(vehicleId) {
    const { data, error } = await supabase.rpc('mark_vehicle_sold', { p_vehicle_id: vehicleId });
    if (error) throw error;
    return data;
  },

  async archiveVehicle(vehicleId) {
    const { data, error } = await supabase.rpc('archive_vehicle', { p_vehicle_id: vehicleId });
    if (error) throw error;
    return data;
  },

  async updatePrice(vehicleId, newPrice, reason) {
    const parsedPrice = toFiniteNumber(newPrice, 'price');
    if (parsedPrice <= 0) throw new Error('Price must be greater than zero.');
    if (!reason?.trim()) throw new Error('A mandatory audit reason is required for price changes.');

    const { data, error } = await supabase.rpc('update_vehicle_price', {
      p_vehicle_id: vehicleId,
      p_new_price: parsedPrice,
      p_reason: reason.trim()
    });
    if (error) throw error;
    return data;
  }
};
