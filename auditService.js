import { supabase } from './vehicleService.js'

/**
 * Fetches the audit history for a specific vehicle.
 */
export async function getVehicleAuditLogs(vehicleUuid) {
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      id,
      action,
      details,
      created_at,
      users (name, email, role)
    `)
    .eq('vehicle_id', vehicleUuid)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching audit logs:', error.message)
    return []
  }

  return data
}
