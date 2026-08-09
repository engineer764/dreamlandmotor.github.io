import { supabase } from './vehicleService.js'

/**
 * Initializes a new inspection record for a vehicle.
 */
export async function createInspection(vehicleId, inspectorId, mileage, inspectionDate) {
  const { data, error } = await supabase
    .from('inspections')
    .insert([
      {
        vehicle_id: vehicleId,
        inspector_id: inspectorId || null,
        mileage: parseInt(mileage),
        inspection_date: inspectionDate,
        overall_status: 'PENDING'
      }
    ])
    .select()

  if (error) throw new Error(error.message)
  return data[0]
}

/**
 * Adds an inspection finding for one of the 6 core areas.
 * Enforces database constraint: ATTENTION/FAIL require finding, significance, and recommended action.
 */
export async function addInspectionFinding(findingData) {
  const { inspectionId, area, rating, finding, significance, recommendedAction } = findingData

  // Client-side guardrail matching database constraint
  if (rating !== 'PASS' && (!finding || !significance || !recommendedAction)) {
    throw new Error('ATTENTION and FAIL ratings require a finding description, significance, and recommended action.')
  }

  const { data, error } = await supabase
    .from('inspection_findings')
    .insert([
      {
        inspection_id: inspectionId,
        area,
        rating,
        finding: rating === 'PASS' ? 'No faults observed' : finding,
        significance: rating === 'PASS' ? 'N/A' : significance,
        recommended_action: rating === 'PASS' ? 'None' : recommendedAction
      }
    ])
    .select()

  if (error) throw new Error(error.message)
  return data[0]
}

/**
 * Uploads a defect evidence photo to Supabase storage and links it to a finding.
 */
export async function uploadFindingPhoto(vehicleId, findingId, file, caption = '') {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36.substring(2, 7))}.${fileExt}`
  const storagePath = `verified-cars/${vehicleId}/findings/${findingId}/${fileName}`

  // 1. Upload to Supabase Storage bucket 'verified-cars'
  const { error: uploadError } = await supabase.storage
    .from('verified-cars')
    .upload(storagePath, file)

  if (uploadError) throw new Error(uploadError.message)

  // 2. Insert record into finding_photos table
  const { data, error: dbError } = await supabase
    .from('finding_photos')
    .insert([
      {
        finding_id: findingId,
        storage_path: storagePath,
        caption: caption
      }
    ])
    .select()

  if (dbError) throw new Error(dbError.message)
  return data[0]
}

/**
 * Uploads the raw inspection PDF report.
 */
export async function uploadInspectionReport(vehicleId, inspectionId, file) {
  const filePath = `verified-cars/${vehicleId}/reports/inspection-report.pdf`

  const { error: uploadError } = await supabase.storage
    .from('verified-cars')
    .upload(filePath, file, { upsert: true })

  if (uploadError) throw new Error(uploadError.message)

  const { error: updateError } = await supabase
    .from('inspections')
    .update({ report_path: filePath })
    .eq('id', inspectionId)

  if (updateError) throw new Error(updateError.message)
  return filePath
}
