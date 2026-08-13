export const inspectionScoring = {
    /**
     * Authoritative component-to-category mapping table.
     * Ensures finding description text never dictates scoring category routing.
     */
    COMPONENT_SCORE_MAP: {
        'Brake': 'brake_score',
        'Brake Pad': 'brake_score',
        'Brake Rotor': 'brake_score',
        'Brake Disc': 'brake_score',
        'Brake Drum': 'brake_score',
        'Brake Caliper': 'brake_score',
        'ABS': 'brake_score',
        'Parking Brake': 'brake_score',
        'Brake Fluid': 'brake_score',
        'Master Cylinder': 'brake_score',

        'Suspension': 'suspension_score',
        'Shock Absorber': 'suspension_score',
        'Strut': 'suspension_score',
        'Spring': 'suspension_score',
        'Ball Joint': 'suspension_score',
        'Control Arm': 'suspension_score',
        'Bushing': 'suspension_score',
        'Wheel Bearing': 'suspension_score',

        'Interior': 'interior_score',
        'Seat': 'interior_score',
        'Dashboard': 'interior_score',
        'HVAC': 'interior_score',
        'Air Conditioning': 'interior_score',
        'Infotainment': 'interior_score',

        'Road Test': 'road_test_score',
        'Steering': 'road_test_score',
        'Handling': 'road_test_score',
        'Driveability': 'road_test_score',
        'Transmission': 'road_test_score',
        'Gearbox': 'road_test_score',
        'Drivetrain': 'road_test_score',
        'Clutch': 'road_test_score',
        'Differential': 'road_test_score',
        'Transfer Case': 'road_test_score'
    },

    /**
     * Resolves target database scoring categories using explicit component taxonomy lookup.
     * Throws an explicit Error if a component is missing or unrecognized.
     */
    resolveTargetScores(finding) {
        const area = finding.area;
        const component = (finding.component || '').trim();

        switch (area) {
            case 'Mechanical':
                return ['mechanical_score'];

            case 'Computer Diagnostics':
                return ['diagnostic_score'];

            case 'Electrical & Electronic':
                return ['electrical_score'];

            case 'Body & Accident':
                return ['body_score'];

            case 'Chassis / Suspension / Braking': {
                const target = this.COMPONENT_SCORE_MAP[component];
                if (!target) {
                    throw new Error(`Unknown chassis/braking component: ${component || 'not specified'}`);
                }
                return [target];
            }

            case 'Interior / Functional / Road Test': {
                const target = this.COMPONENT_SCORE_MAP[component];
                if (!target) {
                    throw new Error(`Unknown interior/road-test component: ${component || 'not specified'}`);
                }
                return [target];
            }

            default:
                throw new Error(`Unknown inspection area: ${area}`);
        }
    },

    /**
     * Calculates category scores based on findings per area and explicit component routing.
     * Validates strict integer severity (1 to 5).
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

        const deductions = {};
        Object.keys(scores).forEach(key => deductions[key] = 0);

        findings.forEach(f => {
            const severity = parseInt(f.severity, 10);
            if (!Number.isInteger(severity) || severity < 1 || severity > 5) {
                throw new Error(`Invalid severity for finding (${f.component || 'Unknown component'}): must be an integer between 1 and 5.`);
            }

            let penalty = 0;
            if (f.rating === 'ATTENTION') {
                penalty = 8 + (severity * 4); // 12 to 28 points
            } else if (f.rating === 'FAIL') {
                penalty = 25 + (severity * 10); // 35 to 75 points
            }

            if (f.is_safety_critical) {
                penalty += 25;
            }

            const targetScores = this.resolveTargetScores(f);

            targetScores.forEach(key => {
                deductions[key] = (deductions[key] || 0) + penalty;
            });
        });

        Object.keys(scores).forEach(key => {
            scores[key] = Math.max(10, Math.round(100 - (deductions[key] || 0)));
        });

        return scores;
    },

    /**
     * Calculates overall score.
     */
    calculateOverallScore(categoryScores) {
        const values = Object.values(categoryScores).filter(v => typeof v === 'number' && !isNaN(v));
        if (values.length === 0) return 0;
        const sum = values.reduce((acc, val) => acc + val, 0);
        return Math.round(sum / values.length);
    },

    determineCondition(overallScore, findings = []) {
        const hasFail = findings.some(f => f.rating === 'FAIL' || f.is_safety_critical);
        if (overallScore >= 92 && !hasFail) return 'EXCELLENT';
        if (overallScore >= 80 && !hasFail) return 'GOOD';
        if (overallScore >= 65) return 'FAIR';
        return 'POOR';
    },

    generateRecommendation(overallScore, findings = []) {
        const hasSafetyCritical = findings.some(f => f.is_safety_critical || f.rating === 'FAIL');
        if (hasSafetyCritical || overallScore < 70) {
            return 'Not recommended without major repairs';
        }
        if (overallScore >= 85) {
            return 'Recommended for purchase';
        }
        return 'Purchase with minor repairs considered';
    },

    generateSummary(overallScore, condition, findings = []) {
        const totalIssues = findings.filter(f => f.rating !== 'PASS').length;
        const safetyCriticalCount = findings.filter(f => f.is_safety_critical).length;

        return `Professional multi-point inspection completed with an overall score of ${overallScore}/100, grading vehicle condition as ${condition}. Identified ${totalIssues} area(s) requiring attention, including ${safetyCriticalCount} safety-critical item(s). Review detailed findings and evidence photos prior to final purchase commitment.`;
    }
};

export const {
    COMPONENT_SCORE_MAP,
    resolveTargetScores,
    calculateCategoryScores,
    calculateOverallScore,
    determineCondition,
    generateRecommendation,
    generateSummary
} = inspectionScoring;
