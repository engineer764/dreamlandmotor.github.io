/**
 * Dreamland PPI v1.0
 * Centralized Inspection Scoring Engine
 *
 * IMPORTANT:
 * - PENDING is not scored.
 * - N/A is not scored.
 * - Safety-critical describes the importance of an item.
 * - A safety-critical item is NOT automatically a defect.
 * - Critical override requires a CRITICAL result on a safety-critical item.
 */

export const inspectionScoring = {

    WEIGHTS: {
        GOOD: 100,
        FAIR: 75,
        ATTENTION: 40,
        CRITICAL: 0
    },

    isScorable(item) {
        return (
            item &&
            item.is_applicable !== false &&
            item.status !== 'N/A' &&
            item.status !== 'PENDING'
        );
    },

    isCriticalDefect(item) {
        return (
            item &&
            item.status === 'CRITICAL' &&
            item.is_safety_critical === true
        );
    },

    calculateSectionScore(items = []) {

        const applicableItems = items.filter(
            item => item?.is_applicable !== false
        );

        const pendingItems = applicableItems.filter(
            item => item.status === 'PENDING'
        );

        const scorableItems = applicableItems.filter(
            item => this.isScorable(item)
        );

        const naItems = items.filter(
            item =>
                item.status === 'N/A' ||
                item.is_applicable === false
        );

        if (scorableItems.length === 0) {
            return {
                score: null,
                applicableCount: applicableItems.length,
                completedCount: 0,
                pendingCount: pendingItems.length,
                naCount: naItems.length,
                defects: 0,
                criticalCount: 0,
                safetyCriticalCount: 0
            };
        }

        let totalPoints = 0;
        let defects = 0;
        let criticalCount = 0;
        let safetyCriticalCount = 0;

        for (const item of scorableItems) {

            const weight =
                this.WEIGHTS[item.status] ?? 0;

            totalPoints += weight;

            if (
                item.status === 'ATTENTION' ||
                item.status === 'CRITICAL'
            ) {
                defects++;
            }

            if (item.is_safety_critical === true) {
                safetyCriticalCount++;
            }

            if (this.isCriticalDefect(item)) {
                criticalCount++;
            }
        }

        return {
            score: Math.round(
                totalPoints / scorableItems.length
            ),

            applicableCount:
                applicableItems.length,

            completedCount:
                scorableItems.length,

            pendingCount:
                pendingItems.length,

            naCount:
                naItems.length,

            defects,

            criticalCount,

            safetyCriticalCount
        };
    },

    calculateOverallScore(sectionResultsMap = {}) {

        let totalPoints = 0;
        let totalScorableItems = 0;

        let totalApplicable = 0;
        let totalCompleted = 0;
        let totalPending = 0;
        let totalNA = 0;

        let totalDefects = 0;
        let totalCriticals = 0;

        for (const result of Object.values(sectionResultsMap)) {

            totalApplicable += result.applicableCount || 0;
            totalCompleted += result.completedCount || 0;
            totalPending += result.pendingCount || 0;
            totalNA += result.naCount || 0;

            totalDefects += result.defects || 0;
            totalCriticals += result.criticalCount || 0;

            /*
             * Reconstruct section points from score × item count.
             *
             * This keeps the overall score based on actual
             * inspection items rather than giving every section
             * equal mathematical weight.
             */
            if (
                result.score !== null &&
                result.score !== undefined &&
                result.completedCount > 0
            ) {
                totalPoints +=
                    result.score * result.completedCount;

                totalScorableItems +=
                    result.completedCount;
            }
        }

        const overallScore =
            totalScorableItems > 0
                ? Math.round(
                    totalPoints / totalScorableItems
                )
                : null;

        const recommendation =
            this.getRecommendation({
                overallScore,
                totalCriticals,
                totalPending
            });

        return {
            overallScore,
            totalApplicable,
            totalCompleted,
            totalPending,
            totalNA,
            totalDefects,
            totalCriticals,
            recommendation
        };
    },

    getRecommendation({
        overallScore,
        totalCriticals = 0,
        totalPending = 0
    }) {

        /*
         * Never issue a final recommendation while
         * applicable inspection items remain unassessed.
         */
        if (totalPending > 0) {
            return {
                code: 'INCOMPLETE',
                text:
                    'INSPECTION INCOMPLETE — Some applicable inspection items have not been assessed.',
                badge:
                    'bg-gray-600 text-white'
            };
        }

        /*
         * Safety-critical CRITICAL finding.
         */
        if (totalCriticals > 0) {
            return {
                code: 'DO_NOT_BUY',
                text:
                    'DO NOT BUY — A serious safety, structural, or critical mechanical defect was identified.',
                badge:
                    'bg-red-600 text-white'
            };
        }

        if (overallScore === null) {
            return {
                code: 'INCOMPLETE',
                text:
                    'INSPECTION INCOMPLETE — No scorable inspection results are available.',
                badge:
                    'bg-gray-600 text-white'
            };
        }

        if (overallScore < 50) {
            return {
                code: 'DO_NOT_BUY',
                text:
                    'DO NOT BUY — Significant mechanical, structural, electrical, or safety concerns were identified.',
                badge:
                    'bg-red-600 text-white'
            };
        }

        if (overallScore < 70) {
            return {
                code: 'BUY_WITH_CAUTION',
                text:
                    'BUY WITH CAUTION — Significant repairs or further investigation are recommended before purchase.',
                badge:
                    'bg-amber-600 text-white'
            };
        }

        if (overallScore < 85) {
            return {
                code: 'BUY_WITH_MINOR_ATTENTION',
                text:
                    'BUY WITH MINOR ATTENTION — The vehicle is generally serviceable, with identified maintenance or repair items.',
                badge:
                    'bg-blue-600 text-white'
            };
        }

        return {
            code: 'BUY',
            text:
                'BUY — The vehicle presents a generally strong inspection result with no major concerns identified.',
            badge:
                'bg-emerald-600 text-white'
        };
    }
};
