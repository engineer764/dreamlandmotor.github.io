import { supabase } from './vehicleService.js'

/**
 * Generates a secure, temporary signed URL to download the vehicle's official PDF inspection report.
 */
export async function getInspectionReportDownloadUrl(storagePath) {
  const { data, error } = await supabase.storage
    .from('verified-cars')
    .createSignedUrl(storagePath, 60) // Valid for 60 seconds

  if (error) {
    console.error('Error generating report link:', error.message)
    throw new Error('Could not retrieve inspection report.')
  }

  return data.signedUrl
}
