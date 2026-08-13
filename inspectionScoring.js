export const inspectionScoring = {
    calculateScores(findings = []) {
        const scores = {
            mechanical: 100,
            electrical: 100,
            body: 100,
            interior: 100,
            suspension: 100,
            brake: 100,
            diagnostic: 100,
            road: 100
        };

        let hasCritical = false;

        findings.forEach(f => {
            const area = (f.area || '').trim();
            const rating = String(f.rating || 'GOOD').toUpperCase();
            const severity = parseInt(f.severity || 1, 10);
            const isSafetyCritical = rating === 'CRITICAL' || f.is_safety_critical;

            if (isSafetyCritical) {
                hasCritical = true;
            }

            let deduction = 0;

            switch (rating) {
                case 'GOOD':
                    deduction = 0;
                    break;
                case 'FAIR':
                    deduction = 3 + severity;
                    break;
                case 'ATTENTION':
                    deduction = 8 + (severity * 4);
                    break;
                case 'CRITICAL':
                    deduction = 25 + (severity * 10);
                    break;
                default:
                    deduction = 0;
            }

            if (isSafetyCritical) {
                deduction += 25;
            }

            if (deduction > 0) {
                if (area === 'Mechanical') {
                    scores.mechanical = Math.max(0, scores.mechanical - deduction);
                } else if (area === 'Computer Diagnostics') {
                    scores.diagnostic = Math.max(0, scores.diagnostic - deduction);
                } else if (area === 'Electrical & Electronic') {
                    scores.electrical = Math.max(0, scores.electrical - deduction);
                } else if (area === 'Body & Accident') {
                    scores.body = Math.max(0, scores.body - deduction);
                } else if (area === 'Chassis / Suspension / Braking') {
                    scores.suspension = Math.max(0, scores.suspension - deduction);
                    scores.brake = Math.max(0, scores.brake - deduction);
                } else if (area === 'Interior / Functional / Road Test') {
                    scores.interior = Math.max(0, scores.interior - deduction);
                    scores.road = Math.max(0, scores.road - deduction);
                }
            }
        });

        // Calculate weighted overall score
        const overall = Math.round(
            (scores.mechanical * 0.20) +
            (scores.diagnostic * 0.10) +
            (scores.electrical * 0.15) +
            (scores.body * 0.15) +
            (scores.suspension * 0.15) +
            (scores.brake * 0.15) +
            (scores.interior * 0.05) +
            (scores.road * 0.05)
        );

        let condition = 'Excellent / Certified Clean';
        let recommendation = 'Recommended for purchase with zero major structural issues.';
        let summary = 'Thorough multi-point inspection completed successfully. All core systems verified.';

        if (hasCritical || overall < 70) {
            condition = 'Requires Significant Attention';
            recommendation = 'Major repairs or critical safety fixes required before purchase.';
            summary = 'Inspection identified critical structural, safety, or mechanical findings requiring remediation.';
        } else if (overall < 85) {
            condition = 'Good with Minor Wear';
            recommendation = 'Recommended for purchase after minor servicing.';
            summary = 'Inspection noted standard wear and tear commensurate with vehicle age and mileage.';
        }

        return {
            overall_score: overall,
            mechanical_score: scores.mechanical,
            electrical_score: scores.electrical,
            body_score: scores.body,
            interior_score: scores.interior,
            suspension_score: scores.suspension,
            brake_score: scores.brake,
            diagnostic_score: scores.diagnostic,
            road_test_score: scores.road,
            overall_condition: condition,
            recommendation: recommendation,
            summary: summary
        };
    }
};

export const { calculateScores } = inspectionScoring;
