export const inspectionScoring = {
    /**
     * Calculates individual category scores based on inspection findings per area.
     * Maps findings to the 8 database category score columns.
     */
    calculateCategoryScores(findings = []) {
        const scores = {
            mechanical_score: 100,
            electrical_score: 100,
            body_score: 100,
            interior_score: 100,
            suspension_score: 100,
            brake_score: 100,
            diagnostic_score: 100,
            road_test_score: 100
        };

        const areaToScoreMap = {
            'Mechanical': ['mechanical_score'],
            'Computer Diagnostics': ['diagnostic_score'],
            'Electrical & Electronic': ['electrical_score'],
            'Body & Accident': ['body_score'],
            'Chassis / Suspension / Braking': ['suspension_score', 'brake_score'],
            'Interior / Functional / Road Test': ['interior_score', 'road_test_score']
        };

        const deductions = {};
        Object.keys(scores).forEach(key => deductions[key] = 0);

        findings.forEach(f => {
            const matchedKeys = areaToScoreMap[f.area] || ['mechanical_score'];
            let penalty = 0;

            if (f.rating === 'ATTENTION') {
                penalty = 12 + ((f.severity || 1) * 3);
            } else if (f.rating === 'FAIL') {
                penalty = 30 + ((f.severity || 1) * 5);
            }

            if (f.is_safety_critical) {
                penalty += 20;
            }

            matchedKeys.forEach(key => {
                deductions[key] = (deductions[key] || 0) + penalty;
            });
        });

        Object.keys(scores).forEach(key => {
            scores[key] = Math.max(10, Math.round(100 - (deductions[key] || 0)));
        });

        return scores;
    },

    /**
     * Calculates the overall score from category scores.
     */
    calculateOverallScore(categoryScores) {
        const values = Object.values(categoryScores).filter(v => typeof v === 'number' && !isNaN(v));
        if (values.length === 0) return 85;
        const sum = values.reduce((acc, val) => acc + val, 0);
        return Math.round(sum / values.length);
    },

    /**
     * Determines overall vehicle condition based on the overall score.
     */
    determineCondition(overallScore) {
        if (overallScore >= 90) return 'EXCELLENT';
        if (overallScore >= 75) return 'GOOD';
        if (overallScore >= 60) return 'FAIR';
        return 'POOR';
    },

    /**
     * Generates a professional recommendation based on score and safety-critical findings.
     */
    generateRecommendation(overallScore, findings = []) {
        const hasSafetyCritical = findings.some(f => f.is_safety_critical || f.rating === 'FAIL');
        if (hasSafetyCritical || overallScore < 60) {
            return 'Not recommended without major repairs';
        }
        if (overallScore >= 85) {
            return 'Recommended for purchase';
        }
        return 'Purchase with minor repairs considered';
    },

    /**
     * Generates a concise professional executive summary narrative.
     */
    generateSummary(overallScore, condition, findings = []) {
        const totalFindings = findings.filter(f => f.rating !== 'PASS').length;
        const safetyCriticalCount = findings.filter(f => f.is_safety_critical).length;

        return `Professional inspection completed with an overall score of ${overallScore}/100, grading vehicle condition as ${condition}. Identified ${totalFindings} focal point(s) requiring attention, including ${safetyCriticalCount} safety-critical item(s). Review detailed findings and evidence photos prior to final purchase commitment.`;
    }
};

export const {
    calculateCategoryScores,
    calculateOverallScore,
    determineCondition,
    generateRecommendation,
    generateSummary
} = inspectionScoring;
