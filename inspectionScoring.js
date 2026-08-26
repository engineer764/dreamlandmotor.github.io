/**
 * Dreamland PPI v1.0 - Centralized Scoring Engine
 */
export const inspectionScoring = {
    WEIGHTS: {
        'GOOD': 100,
        'FAIR': 75,
        'ATTENTION': 40,
        'CRITICAL': 0
    },

    /**
     * Calculate section score from its checklist items
     * Excludes N/A and PENDING items from scoring and denominator count.
     */
    calculateSectionScore(items = []) {
        const scorableItems = items.filter(item => 
            item.is_applicable !== false && 
            item.status !== 'N/A' && 
            item.status !== 'PENDING'
        );

        if (scorableItems.length === 0) {
            return { score: 100, applicableCount: 0, completedCount: 0, defects: 0, criticalCount: 0 };
        }

        let totalPoints = 0;
        let defects = 0;
        let criticalCount = 0;

        scorableItems.forEach(item => {
            const weight = this.WEIGHTS[item.status] ?? 100;
            totalPoints += weight;

            if (item.status === 'ATTENTION' || item.status === 'CRITICAL') {
                defects++;
            }
            if (item.status === 'CRITICAL' || item.is_safety_critical) {
                criticalCount++;
            }
        });

        const score = Math.round(totalPoints / scorableItems.length);
        return {
            score,
            applicableCount: scorableItems.length,
            completedCount: scorableItems.length,
            defects,
            criticalCount
        };
    },

    /**
     * Calculate overall score across all section results and apply critical overrides.
     */
    calculateOverallScore(sectionResultsMap = {}) {
        let totalScoreSum = 0;
        let sectionCount = 0;
        let totalDefects = 0;
        let totalCriticals = 0;
        let totalApplicable = 0;
        let totalCompleted = 0;

        Object.values(sectionResultsMap).forEach(res => {
            if (res.applicableCount > 0) {
                totalScoreSum += res.score;
                sectionCount++;
            }
            totalDefects += res.defects;
            totalCriticals += res.criticalCount;
            totalApplicable += res.applicableCount;
            totalCompleted += res.completedCount;
        });

        let overallScore = sectionCount > 0 ? Math.round(totalScoreSum / sectionCount) : 100;

        // Critical Override
        if (totalCriticals > 0) {
            overallScore = Math.min(overallScore, 49); // Cap score if critical safety/structural issues exist
        }

        return {
            overallScore,
            totalDefects,
            totalCriticals,
            totalApplicable,
            totalCompleted,
            recommendation: this.getRecommendation(overallScore, totalCriticals)
        };
    },

    getRecommendation(overallScore, criticalCount) {
        if (criticalCount > 0 || overallScore < 50) {
            return { text: "DO NOT BUY — Severe structural, safety, or mechanical defects identified.", badge: "bg-red-600 text-white" };
        } else if (overallScore < 70) {
            return { text: "PASS WITH CONDITIONS — Significant maintenance or repairs required.", badge: "bg-amber-600 text-white" };
        } else if (overallScore < 85) {
            return { text: "GOOD CONDITION — Minor cosmetic or normal wear items noted.", badge: "bg-blue-600 text-white" };
        } else {
            return { text: "EXCELLENT CONDITION — Well-maintained and verified sound.", badge: "bg-emerald-600 text-white" };
        }
    }
};
