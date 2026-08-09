import { supabase } from './supabaseClient.js'

/**
 * Creates a new vehicle draft. 
 * The database trigger automatically assigns sequential IDs like DV-001.
 */
export async function createVehicle(vehicleData) {
  const { data, error } = await supabase
    .from('vehicles')
    .insert([
      {
        make: vehicleData.make,
        model: vehicleData.model,
        trim: vehicleData.trim || null,
        year: parseInt(vehicleData.year),
        mileage: parseInt(vehicleData.mileage),
        engine: vehicleData.engine,
        transmission: vehicleData.transmission,
        fuel_type: vehicleData.fuelType,
        colour: vehicleData.colour,
        body_type: vehicleData.bodyType || null,
        vin: vehicleData.vin || null,
        registration_number: vehicleData.registrationNumber || null,
        location: vehicleData.location,
        price: parseFloat(vehicleData.price),
        sales_status: 'DRAFT',
        verification_status: 'PENDING'
      }
    ])
    .select()

  if (error) {
    console.error('Error creating vehicle:', error.message)
    throw new Error(error.message)
  }

  return data[0]
}

/**
 * Fetches all vehicles for the Admin Dashboard with optional status filtering.
 */
export async function getAdminVehicles(statusFilter = null) {
  let query = supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false })

  if (statusFilter && statusFilter !== 'ALL') {
    query = query.eq('sales_status', statusFilter)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching vehicles:', error.message)
    return []
  }

  return data
}
