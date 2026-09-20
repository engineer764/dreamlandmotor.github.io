import { supabase } from './supabaseClient.js';

export const inspectionReportService = {
    async generateOfficialReport(inspectionId) {
        if (!inspectionId) {
            throw new Error('Inspection ID is required.');
        }

        const {
            data: { user },
            error: authErr
        } = await supabase.auth.getUser();

        if (authErr || !user) {
            throw new Error('Authentication required.');
        }

        const { data, error } = await supabase.functions.invoke(
            'generate-ppi-report',
            {
                body: { inspectionId }
            }
        );

        if (error) {
            // Try to extract the actual JSON error returned
            // by the Edge Function.
            try {
                const response = error.context;

                if (response && typeof response.clone === 'function') {
                    const responseCopy = response.clone();
                    const raw = await responseCopy.text();

                    if (raw) {
                        try {
                            const payload = JSON.parse(raw);

                            if (payload?.error) {
                                throw new Error(
                                    `Report generation failed: ${payload.error}`
                                );
                            }
                        } catch (parseError) {
                            if (
                                parseError instanceof Error &&
                                parseError.message.startsWith(
                                    'Report generation failed:'
                                )
                            ) {
                                throw parseError;
                            }
                        }
                    }
                }
            } catch (detailError) {
                if (
                    detailError instanceof Error &&
                    detailError.message.startsWith(
                        'Report generation failed:'
                    )
                ) {
                    throw detailError;
                }
            }

            throw new Error(
                error.message ||
                'Report generation request failed.'
            );
        }

        if (!data?.success) {
            throw new Error(
                data?.error ||
                'Report generation failed on the server.'
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

        if (error) {
            console.error(
                'Error generating official report URL:',
                error.message
            );

            throw new Error(
                'Could not retrieve the official inspection report.'
            );
        }

        return data.signedUrl;
    }
};
