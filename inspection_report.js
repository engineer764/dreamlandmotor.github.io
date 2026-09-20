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
};
