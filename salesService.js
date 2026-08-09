import { supabase } from './vehicleService.js'

/**
 * Updates a vehicle's sales status and records the corresponding timestamp and audit log.
 * 
 * @param {string} vehicleUuid - The UUID primary key of the vehicle
 * @param {string} newStatus - 'DRAFT' | 'PUBLISHED' | 'RESERVED' | 'SOLD' | 'ARCHIVED'
 * @param {string} userId - The admin user's UUID performing the action
 */
export async function updateVehicleSalesStatus(vehicleUuid, newStatus, userId) {
  const updatePayload = { sales_status: newStatus }
  const now = new Date().toISOString()

  // Assign timestamps based on status transition
  if (newStatus === 'SOLD') {
    updatePayload.sold_at = now
  } else if (newStatus === 'RESERVED') {
    updatePayload.reserved_at = now
  } else if (newStatus === 'PUBLISHED') {
    updatePayload.published_at = now
  }

  // 1. Perform database update
  const { data: updatedVehicle, error: updateError } = await supabase
    .from('vehicles')
    .update(updatePayload)
    .eq('id', vehicleUuid)
    .select()

  if (updateError) {
    console.error('Error updating vehicle status:', updateError.message)
    throw new Error(updateError.message)
  }

  // 2. Record action in audit logs
  const { error: auditError } = await supabase
    .from('audit_logs')
    .insert([
      {
        vehicle_id: vehicleUuid,
        user_id: userId,
        action: `SALES_STATUS_CHANGE`,
        details: `Status changed to ${newStatus} at ${now}`
      }
    ])

  if (auditError) {
    console.warn('Audit log entry failed, but status update succeeded:', auditError.message)
  }

  return updatedVehicle[0]
}
