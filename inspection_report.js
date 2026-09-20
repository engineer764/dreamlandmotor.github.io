import { supabase } from './supabaseClient.js';

export const inspectionReportService = {
    async generateOfficialReport(inspectionId) {
        const { data: { user }, error: authErr } =
            await supabase.auth.getUser();

        if (authErr || !user) {
            throw new Error('Authentication required.');
        }

        const { data, error } = await supabase.functions.invoke(
            'generate-ppi-report',
            {
                body: { inspectionId }
            }
        );

        if (error) throw error;

        if (!data?.success) {
            throw new Error(
                data?.error || 'Report generation failed on the server.'
            );
        }

        return data.reportPath;
    },

    async getOfficialReportUrl(storagePath) {
        if (!storagePath) {
            throw new Error('Report path not specified.');
        }

        const { data, error } = await supabase.storage
            .from('inspection-reports')
            .createSignedUrl(storagePath, 300);

        if (error) throw error;

        return data.signedUrl;
    }
};import { supabase } from './vehicleService.js'

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
