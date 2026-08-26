export const MASTER_CHECKLIST = [
    // ==========================================================
    // SECTION 1 — VEHICLE IDENTIFICATION
    // ==========================================================
    { section: 'Identification', item_code: 'VEH-VIN-001', item_name: 'VIN physically verified', sort_order: 10 },
    { section: 'Identification', item_code: 'VEH-VIN-002', item_name: 'VIN matches supplied documents', sort_order: 20 },
    { section: 'Identification', item_code: 'VEH-REG-001', item_name: 'Registration number verified', sort_order: 30 },
    { section: 'Identification', item_code: 'VEH-REG-002', item_name: 'Registration/document consistency', sort_order: 40 },
    { section: 'Identification', item_code: 'VEH-MIL-001', item_name: 'Dashboard mileage recorded', sort_order: 50, measurement_unit: 'km' },
    { section: 'Identification', item_code: 'VEH-ENG-001', item_name: 'Engine number verified', sort_order: 60, default_applicable: false },
    { section: 'Identification', item_code: 'VEH-CHS-001', item_name: 'Chassis/body number verified', sort_order: 70 },
    { section: 'Identification', item_code: 'VEH-MAKE-001', item_name: 'Make verified', sort_order: 80 },
    { section: 'Identification', item_code: 'VEH-MOD-001', item_name: 'Model verified', sort_order: 90 },
    { section: 'Identification', item_code: 'VEH-YEAR-001', item_name: 'Year verified', sort_order: 100 },
    { section: 'Identification', item_code: 'VEH-TRIM-001', item_name: 'Trim/variant verified', sort_order: 110 },
    { section: 'Identification', item_code: 'VEH-BODY-001', item_name: 'Body type verified', sort_order: 120 },
    { section: 'Identification', item_code: 'VEH-FUEL-001', item_name: 'Fuel type verified', sort_order: 130 },
    { section: 'Identification', item_code: 'VEH-TRANS-001', item_name: 'Transmission type verified', sort_order: 140 },
    { section: 'Identification', item_code: 'VEH-COLOR-001', item_name: 'Exterior colour verified', sort_order: 150 },

    // ==========================================================
    // SECTION 2 — ENGINE
    // ==========================================================
    // ENGINE START / OPERATION
    { section: 'Engine', item_code: 'ENG-STR-001', item_name: 'Engine starts normally', sort_order: 200 },
    { section: 'Engine', item_code: 'ENG-STR-002', item_name: 'Cold-start behaviour', sort_order: 210 },
    { section: 'Engine', item_code: 'ENG-IDL-001', item_name: 'Engine idle stability', sort_order: 220 },
    { section: 'Engine', item_code: 'ENG-IDL-002', item_name: 'Idle RPM', sort_order: 230, measurement_unit: 'RPM' },
    { section: 'Engine', item_code: 'ENG-ACC-001', item_name: 'Engine acceleration response', sort_order: 240 },
    { section: 'Engine', item_code: 'ENG-THR-001', item_name: 'Throttle response', sort_order: 250 },
    { section: 'Engine', item_code: 'ENG-MSF-001', item_name: 'Engine misfire evidence', sort_order: 260, is_safety_critical: true },
    { section: 'Engine', item_code: 'ENG-HST-001', item_name: 'Engine hesitation', sort_order: 270 },
    { section: 'Engine', item_code: 'ENG-VIB-001', item_name: 'Engine vibration', sort_order: 280 },
    { section: 'Engine', item_code: 'ENG-NSE-001', item_name: 'Abnormal engine noise', sort_order: 290 },
    { section: 'Engine', item_code: 'ENG-TIM-001', item_name: 'Timing-chain/belt noise where applicable', sort_order: 300, default_applicable: false },
    { section: 'Engine', item_code: 'ENG-WRN-001', item_name: 'Engine warning light', sort_order: 310, is_safety_critical: true },
    { section: 'Engine', item_code: 'ENG-SMK-001', item_name: 'Exhaust smoke', sort_order: 320 },
    { section: 'Engine', item_code: 'ENG-SMK-002', item_name: 'Exhaust smoke colour/character', sort_order: 330 },
    { section: 'Engine', item_code: 'ENG-BLW-001', item_name: 'Blow-by evidence', sort_order: 340 },

    // ENGINE OIL
    { section: 'Engine', item_code: 'ENG-OIL-001', item_name: 'Engine oil level', sort_order: 350 },
    { section: 'Engine', item_code: 'ENG-OIL-002', item_name: 'Engine oil condition', sort_order: 360 },
    { section: 'Engine', item_code: 'ENG-OIL-003', item_name: 'Engine oil colour', sort_order: 370 },
    { section: 'Engine', item_code: 'ENG-OIL-004', item_name: 'Engine oil contamination', sort_order: 380, is_safety_critical: true },
    { section: 'Engine', item_code: 'ENG-OIL-005', item_name: 'Oil filler cap condition', sort_order: 390 },
    { section: 'Engine', item_code: 'ENG-OIL-006', item_name: 'Sludge evidence', sort_order: 400, is_safety_critical: true },
    { section: 'Engine', item_code: 'ENG-OIL-007', item_name: 'Oil leakage', sort_order: 410 },
    { section: 'Engine', item_code: 'ENG-OIL-008', item_name: 'Oil pressure warning', sort_order: 420, is_safety_critical: true },

    // COOLING
    { section: 'Engine', item_code: 'ENG-CLG-001', item_name: 'Engine operating temperature', sort_order: 430 },
    { section: 'Engine', item_code: 'ENG-CLG-002', item_name: 'Overheating evidence', sort_order: 440, is_safety_critical: true },
    { section: 'Engine', item_code: 'ENG-CLG-003', item_name: 'Temperature warning', sort_order: 450, is_safety_critical: true },
    { section: 'Engine', item_code: 'ENG-CLG-004', item_name: 'Cooling fan operation', sort_order: 460 },
    { section: 'Engine', item_code: 'ENG-CLG-005', item_name: 'Cooling fan control', sort_order: 470 },
    { section: 'Engine', item_code: 'ENG-CLG-006', item_name: 'Thermostat operation', sort_order: 480 },
    { section: 'Engine', item_code: 'ENG-CLG-007', item_name: 'Water pump operation', sort_order: 490 },
    { section: 'Engine', item_code: 'ENG-CLG-008', item_name: 'Water pump leakage', sort_order: 500 },
    { section: 'Engine', item_code: 'ENG-CLG-009', item_name: 'Radiator condition', sort_order: 510 },
    { section: 'Engine', item_code: 'ENG-CLG-010', item_name: 'Coolant reservoir', sort_order: 520 },
    { section: 'Engine', item_code: 'ENG-CLG-011', item_name: 'Coolant level', sort_order: 530 },
    { section: 'Engine', item_code: 'ENG-CLG-012', item_name: 'Coolant condition', sort_order: 540 },
    { section: 'Engine', item_code: 'ENG-CLG-013', item_name: 'Coolant leakage', sort_order: 550 },
    { section: 'Engine', item_code: 'ENG-CLG-014', item_name: 'Radiator hoses', sort_order: 560 },
    { section: 'Engine', item_code: 'ENG-CLG-015', item_name: 'Heater hoses', sort_order: 570 },
    { section: 'Engine', item_code: 'ENG-CLG-016', item_name: 'Hose clamps', sort_order: 580 },

    // ENGINE MOUNTS
    { section: 'Engine', item_code: 'ENG-MNT-001', item_name: 'Engine mount condition', sort_order: 590 },
    { section: 'Engine', item_code: 'ENG-MNT-002', item_name: 'Excessive engine movement', sort_order: 600 },
    { section: 'Engine', item_code: 'ENG-MNT-003', item_name: 'Engine mount leakage where hydraulic', sort_order: 610, default_applicable: false },

    // AIR INTAKE
    { section: 'Engine', item_code: 'ENG-AIR-001', item_name: 'Air filter', sort_order: 620 },
    { section: 'Engine', item_code: 'ENG-AIR-002', item_name: 'Air filter housing', sort_order: 630 },
    { section: 'Engine', item_code: 'ENG-AIR-003', item_name: 'Intake duct', sort_order: 640 },
    { section: 'Engine', item_code: 'ENG-AIR-004', item_name: 'Intake duct cracks', sort_order: 650 },
    { section: 'Engine', item_code: 'ENG-AIR-005', item_name: 'Intake air leakage', sort_order: 660 },
    { section: 'Engine', item_code: 'ENG-AIR-006', item_name: 'Throttle body', sort_order: 670 },
    { section: 'Engine', item_code: 'ENG-AIR-007', item_name: 'MAF sensor where applicable', sort_order: 680, default_applicable: false },
    { section: 'Engine', item_code: 'ENG-AIR-008', item_name: 'MAP sensor where applicable', sort_order: 690, default_applicable: false },
    { section: 'Engine', item_code: 'ENG-AIR-009', item_name: 'Intake manifold', sort_order: 700 },
    { section: 'Engine', item_code: 'ENG-AIR-010', item_name: 'PCV system', sort_order: 710 },

    // FUEL
    { section: 'Engine', item_code: 'ENG-FUL-001', item_name: 'Fuel delivery', sort_order: 720 },
    { section: 'Engine', item_code: 'ENG-FUL-002', item_name: 'Fuel pressure where tested', sort_order: 730, measurement_unit: 'PSI', default_applicable: false },
    { section: 'Engine', item_code: 'ENG-FUL-003', item_name: 'Fuel injectors', sort_order: 740 },
    { section: 'Engine', item_code: 'ENG-FUL-004', item_name: 'Fuel rail', sort_order: 750 },
    { section: 'Engine', item_code: 'ENG-FUL-005', item_name: 'Fuel lines', sort_order: 760 },
    { section: 'Engine', item_code: 'ENG-FUL-006', item_name: 'Fuel leakage', sort_order: 770, is_safety_critical: true },
    { section: 'Engine', item_code: 'ENG-FUL-007', item_name: 'Fuel pump operation where testable', sort_order: 780, default_applicable: false },

    // EXHAUST
    { section: 'Engine', item_code: 'ENG-EXH-001', item_name: 'Exhaust manifold', sort_order: 790 },
    { section: 'Engine', item_code: 'ENG-EXH-002', item_name: 'Exhaust manifold leakage', sort_order: 800 },
    { section: 'Engine', item_code: 'ENG-EXH-003', item_name: 'Exhaust piping', sort_order: 810 },
    { section: 'Engine', item_code: 'ENG-EXH-004', item_name: 'Exhaust leakage', sort_order: 820 },
    { section: 'Engine', item_code: 'ENG-EXH-005', item_name: 'Catalytic converter', sort_order: 830 },
    { section: 'Engine', item_code: 'ENG-EXH-006', item_name: 'Oxygen/AF sensors', sort_order: 840 },
    { section: 'Engine', item_code: 'ENG-EXH-007', item_name: 'Exhaust noise', sort_order: 850 },

    // ==========================================================
    // SECTION 3 — FLUIDS & LEAK SURVEY
    // ==========================================================
    { section: 'Fluids', item_code: 'FLD-ENG-001', item_name: 'Engine oil', sort_order: 900 },
    { section: 'Fluids', item_code: 'FLD-TRN-001', item_name: 'Transmission fluid', sort_order: 910 },
    { section: 'Fluids', item_code: 'FLD-BRK-001', item_name: 'Brake fluid', sort_order: 920 },
    { section: 'Fluids', item_code: 'FLD-PWR-001', item_name: 'Power steering fluid where applicable', sort_order: 930, default_applicable: false },
    { section: 'Fluids', item_code: 'FLD-DIF-001', item_name: 'Differential fluid where applicable', sort_order: 940, default_applicable: false },
    { section: 'Fluids', item_code: 'FLD-TRF-001', item_name: 'Transfer-case fluid where applicable', sort_order: 950, default_applicable: false },
    { section: 'Fluids', item_code: 'FLD-CLG-001', item_name: 'Coolant', sort_order: 960 },
    { section: 'Fluids', item_code: 'FLD-WSH-001', item_name: 'Washer fluid', sort_order: 970 },

    // Leak survey:
    { section: 'Fluids', item_code: 'LEK-OIL-001', item_name: 'Engine oil leak', sort_order: 980 },
    { section: 'Fluids', item_code: 'LEK-TRN-001', item_name: 'Transmission fluid leak', sort_order: 990 },
    { section: 'Fluids', item_code: 'LEK-CLG-001', item_name: 'Coolant leak', sort_order: 1000 },
    { section: 'Fluids', item_code: 'LEK-BRK-001', item_name: 'Brake fluid leak', sort_order: 1010, is_safety_critical: true },
    { section: 'Fluids', item_code: 'LEK-PWR-001', item_name: 'Power steering fluid leak', sort_order: 1020 },
    { section: 'Fluids', item_code: 'LEK-DIF-001', item_name: 'Differential leak', sort_order: 1030 },
    { section: 'Fluids', item_code: 'LEK-TRF-001', item_name: 'Transfer-case leak', sort_order: 1040, default_applicable: false },
    { section: 'Fluids', item_code: 'LEK-FUL-001', item_name: 'Fuel leak', sort_order: 1050, is_safety_critical: true },
    { section: 'Fluids', item_code: 'LEK-OTH-001', item_name: 'Other visible fluid leak', sort_order: 1060 },

    // ==========================================================
    // SECTION 4 — TRANSMISSION & DRIVETRAIN
    // ==========================================================
    // AUTOMATIC TRANSMISSION
    { section: 'Transmission', item_code: 'TRN-AUT-001', item_name: 'Transmission casing', sort_order: 1100 },
    { section: 'Transmission', item_code: 'TRN-AUT-002', item_name: 'Transmission mounting', sort_order: 1110 },
    { section: 'Transmission', item_code: 'TRN-AUT-003', item_name: 'Transmission fluid level where accessible', sort_order: 1120 },
    { section: 'Transmission', item_code: 'TRN-AUT-004', item_name: 'Transmission fluid condition where accessible', sort_order: 1130 },
    { section: 'Transmission', item_code: 'TRN-AUT-005', item_name: 'Transmission leakage', sort_order: 1140 },
    { section: 'Transmission', item_code: 'TRN-AUT-006', item_name: 'Transmission cooler lines', sort_order: 1150 },
    { section: 'Transmission', item_code: 'TRN-AUT-007', item_name: 'Transmission electrical connectors', sort_order: 1160 },
    { section: 'Transmission', item_code: 'TRN-AUT-008', item_name: 'Shift linkage', sort_order: 1170 },
    { section: 'Transmission', item_code: 'TRN-AUT-009', item_name: 'Park engagement', sort_order: 1180, is_safety_critical: true },
    { section: 'Transmission', item_code: 'TRN-AUT-010', item_name: 'Reverse engagement', sort_order: 1190 },
    { section: 'Transmission', item_code: 'TRN-AUT-011', item_name: 'Drive engagement', sort_order: 1200 },
    { section: 'Transmission', item_code: 'TRN-AUT-012', item_name: 'Engagement delay', sort_order: 1210 },
    { section: 'Transmission', item_code: 'TRN-AUT-013', item_name: 'Gear shifting', sort_order: 1220 },
    { section: 'Transmission', item_code: 'TRN-AUT-014', item_name: 'Shift smoothness', sort_order: 1230 },
    { section: 'Transmission', item_code: 'TRN-AUT-015', item_name: 'Shift shock', sort_order: 1240 },
    { section: 'Transmission', item_code: 'TRN-AUT-016', item_name: 'Transmission slipping', sort_order: 1250 },
    { section: 'Transmission', item_code: 'TRN-AUT-017', item_name: 'Transmission flare', sort_order: 1260 },
    { section: 'Transmission', item_code: 'TRN-AUT-018', item_name: 'Kickdown operation', sort_order: 1270 },
    { section: 'Transmission', item_code: 'TRN-AUT-019', item_name: 'Manual mode where applicable', sort_order: 1280, default_applicable: false },
    { section: 'Transmission', item_code: 'TRN-AUT-020', item_name: 'Transmission noise', sort_order: 1290 },
    { section: 'Transmission', item_code: 'TRN-AUT-021', item_name: 'Transmission vibration', sort_order: 1300 },
    { section: 'Transmission', item_code: 'TRN-AUT-022', item_name: 'Transmission warning', sort_order: 1310, is_safety_critical: true },

    // MANUAL TRANSMISSION
    { section: 'Transmission', item_code: 'TRN-MAN-001', item_name: 'Manual clutch pedal', sort_order: 1320, default_applicable: false },
    { section: 'Transmission', item_code: 'TRN-MAN-002', item_name: 'Clutch engagement', sort_order: 1330, default_applicable: false },
    { section: 'Transmission', item_code: 'TRN-MAN-003', item_name: 'Clutch slip', sort_order: 1340, default_applicable: false },
    { section: 'Transmission', item_code: 'TRN-MAN-004', item_name: 'Clutch judder', sort_order: 1350, default_applicable: false },
    { section: 'Transmission', item_code: 'TRN-MAN-005', item_name: 'Clutch noise', sort_order: 1360, default_applicable: false },
    { section: 'Transmission', item_code: 'TRN-MAN-006', item_name: 'Gear engagement', sort_order: 1370, default_applicable: false },
    { section: 'Transmission', item_code: 'TRN-MAN-007', item_name: 'Gear selection', sort_order: 1380, default_applicable: false },
    { section: 'Transmission', item_code: 'TRN-MAN-008', item_name: 'Reverse selection', sort_order: 1390, default_applicable: false },
    { section: 'Transmission', item_code: 'TRN-MAN-009', item_name: 'Synchronizer operation', sort_order: 1400, default_applicable: false },
    { section: 'Transmission', item_code: 'TRN-MAN-010', item_name: 'Gear noise', sort_order: 1410, default_applicable: false },
    { section: 'Transmission', item_code: 'TRN-MAN-011', item_name: 'Clutch hydraulic system', sort_order: 1420, default_applicable: false },
    { section: 'Transmission', item_code: 'TRN-MAN-012', item_name: 'Transmission leakage', sort_order: 1430, default_applicable: false },

    // DRIVETRAIN
    { section: 'Transmission', item_code: 'DRV-CVJ-001', item_name: 'CV joints — front left', sort_order: 1440 },
    { section: 'Transmission', item_code: 'DRV-CVJ-002', item_name: 'CV joints — front right', sort_order: 1450 },
    { section: 'Transmission', item_code: 'DRV-CVJ-003', item_name: 'CV joints — rear left where applicable', sort_order: 1460, default_applicable: false },
    { section: 'Transmission', item_code: 'DRV-CVJ-004', item_name: 'CV joints — rear right where applicable', sort_order: 1470, default_applicable: false },
    // Individualized CV boots
    { section: 'Transmission', item_code: 'DRV-CVB-FLI', item_name: 'Front-left inner CV boot', sort_order: 1480 },
    { section: 'Transmission', item_code: 'DRV-CVB-FLO', item_name: 'Front-left outer CV boot', sort_order: 1481 },
    { section: 'Transmission', item_code: 'DRV-CVB-FRI', item_name: 'Front-right inner CV boot', sort_order: 1482 },
    { section: 'Transmission', item_code: 'DRV-CVB-FRO', item_name: 'Front-right outer CV boot', sort_order: 1483 },
    { section: 'Transmission', item_code: 'DRV-CVB-RLI', item_name: 'Rear-left inner CV boot where applicable', sort_order: 1484, default_applicable: false },
    { section: 'Transmission', item_code: 'DRV-CVB-RLO', item_name: 'Rear-left outer CV boot where applicable', sort_order: 1485, default_applicable: false },
    { section: 'Transmission', item_code: 'DRV-CVB-RRI', item_name: 'Rear-right inner CV boot where applicable', sort_order: 1486, default_applicable: false },
    { section: 'Transmission', item_code: 'DRV-CVB-RRO', item_name: 'Rear-right outer CV boot where applicable', sort_order: 1487, default_applicable: false },

    { section: 'Transmission', item_code: 'DRV-DRV-001', item_name: 'Driveshaft', sort_order: 1490 },
    { section: 'Transmission', item_code: 'DRV-UNI-001', item_name: 'Universal joints', sort_order: 1500 },
    { section: 'Transmission', item_code: 'DRV-PRP-001', item_name: 'Propeller shaft', sort_order: 1510 },
    { section: 'Transmission', item_code: 'DRV-DIF-001', item_name: 'Differential', sort_order: 1520 },
    { section: 'Transmission', item_code: 'DRV-DIF-002', item_name: 'Differential noise', sort_order: 1530 },
    { section: 'Transmission', item_code: 'DRV-DIF-003', item_name: 'Differential leakage', sort_order: 1540 },
    { section: 'Transmission', item_code: 'DRV-AXL-001', item_name: 'Axle seals', sort_order: 1550 },
    { section: 'Transmission', item_code: 'DRV-TRF-001', item_name: 'Transfer case where applicable', sort_order: 1560, default_applicable: false },
    { section: 'Transmission', item_code: 'DRV-AWD-001', item_name: 'AWD/4WD engagement where applicable', sort_order: 1570, default_applicable: false },
    { section: 'Transmission', item_code: 'DRV-VIB-001', item_name: 'Drivetrain vibration', sort_order: 1580 },

    // ==========================================================
    // SECTION 5 — BRAKING SYSTEM
    // ==========================================================
    // BRAKE CONTROLS
    { section: 'Brakes', item_code: 'BRK-CTL-001', item_name: 'Brake pedal condition', sort_order: 1600 },
    { section: 'Brakes', item_code: 'BRK-CTL-002', item_name: 'Brake pedal travel', sort_order: 1610 },
    { section: 'Brakes', item_code: 'BRK-CTL-003', item_name: 'Brake pedal firmness', sort_order: 1620, is_safety_critical: true },
    { section: 'Brakes', item_code: 'BRK-CTL-004', item_name: 'Brake pedal return', sort_order: 1630 },
    { section: 'Brakes', item_code: 'BRK-CTL-005', item_name: 'Brake fluid level', sort_order: 1640 },
    { section: 'Brakes', item_code: 'BRK-CTL-006', item_name: 'Brake fluid condition', sort_order: 1650 },
    { section: 'Brakes', item_code: 'BRK-CTL-007', item_name: 'Brake fluid leakage', sort_order: 1660, is_safety_critical: true },
    { section: 'Brakes', item_code: 'BRK-CTL-008', item_name: 'Brake warning light', sort_order: 1670, is_safety_critical: true },

    // FRONT LEFT
    { section: 'Brakes', item_code: 'BRK-FL-001', item_name: 'Front-left brake pad', sort_order: 1680, measurement_unit: 'mm', is_safety_critical: true },
    { section: 'Brakes', item_code: 'BRK-FL-002', item_name: 'Front-left brake disc', sort_order: 1690, measurement_unit: 'mm', is_safety_critical: true },
    { section: 'Brakes', item_code: 'BRK-FL-003', item_name: 'Front-left caliper', sort_order: 1700 },
    { section: 'Brakes', item_code: 'BRK-FL-004', item_name: 'Front-left brake hose', sort_order: 1710, is_safety_critical: true },
    { section: 'Brakes', item_code: 'BRK-FL-005', item_name: 'Front-left brake line', sort_order: 1720, is_safety_critical: true },

    // FRONT RIGHT
    { section: 'Brakes', item_code: 'BRK-FR-001', item_name: 'Front-right brake pad', sort_order: 1730, measurement_unit: 'mm', is_safety_critical: true },
    { section: 'Brakes', item_code: 'BRK-FR-002', item_name: 'Front-right brake disc', sort_order: 1740, measurement_unit: 'mm', is_safety_critical: true },
    { section: 'Brakes', item_code: 'BRK-FR-003', item_name: 'Front-right caliper', sort_order: 1750 },
    { section: 'Brakes', item_code: 'BRK-FR-004', item_name: 'Front-right brake hose', sort_order: 1760, is_safety_critical: true },
    { section: 'Brakes', item_code: 'BRK-FR-005', item_name: 'Front-right brake line', sort_order: 1770, is_safety_critical: true },

    // REAR LEFT
    { section: 'Brakes', item_code: 'BRK-RL-001', item_name: 'Rear-left brake pad/shoe', sort_order: 1780, measurement_unit: 'mm', is_safety_critical: true },
    { section: 'Brakes', item_code: 'BRK-RL-002', item_name: 'Rear-left brake disc/drum', sort_order: 1790, measurement_unit: 'mm', is_safety_critical: true },
    { section: 'Brakes', item_code: 'BRK-RL-003', item_name: 'Rear-left caliper/wheel cylinder', sort_order: 1800 },
    { section: 'Brakes', item_code: 'BRK-RL-004', item_name: 'Rear-left brake hose', sort_order: 1810, is_safety_critical: true },
    { section: 'Brakes', item_code: 'BRK-RL-005', item_name: 'Rear-left brake line', sort_order: 1820, is_safety_critical: true },

    // REAR RIGHT
    { section: 'Brakes', item_code: 'BRK-RR-001', item_name: 'Rear-right brake pad/shoe', sort_order: 1830, measurement_unit: 'mm', is_safety_critical: true },
    { section: 'Brakes', item_code: 'BRK-RR-002', item_name: 'Rear-right brake disc/drum', sort_order: 1840, measurement_unit: 'mm', is_safety_critical: true },
    { section: 'Brakes', item_code: 'BRK-RR-003', item_name: 'Rear-right caliper/wheel cylinder', sort_order: 1850 },
    { section: 'Brakes', item_code: 'BRK-RR-004', item_name: 'Rear-right brake hose', sort_order: 1860, is_safety_critical: true },
    { section: 'Brakes', item_code: 'BRK-RR-005', item_name: 'Rear-right brake line', sort_order: 1870, is_safety_critical: true },

    // ABS / STABILITY
    { section: 'Brakes', item_code: 'ABS-SYS-001', item_name: 'ABS warning light', sort_order: 1880, is_safety_critical: true },
    { section: 'Brakes', item_code: 'ABS-SYS-002', item_name: 'ABS operation', sort_order: 1890, is_safety_critical: true },
    { section: 'Brakes', item_code: 'ABS-SYS-003', item_name: 'ABS diagnostic faults', sort_order: 1900 },
    { section: 'Brakes', item_code: 'ABS-SYS-004', item_name: 'Wheel-speed sensors', sort_order: 1910 },
    { section: 'Brakes', item_code: 'ABS-SYS-005', item_name: 'ABS wiring', sort_order: 1920 },
    { section: 'Brakes', item_code: 'ABS-SYS-006', item_name: 'ABS module', sort_order: 1930 },
    { section: 'Brakes', item_code: 'ABS-SYS-007', item_name: 'Electronic parking brake where equipped', sort_order: 1940, default_applicable: false },
    { section: 'Brakes', item_code: 'ABS-SYS-008', item_name: 'Stability-control warning', sort_order: 1950, is_safety_critical: true },
    { section: 'Brakes', item_code: 'ABS-SYS-009', item_name: 'Traction-control warning', sort_order: 1960 },

    // ==========================================================
    // SECTION 6 — SUSPENSION
    // ==========================================================
    // FRONT LEFT
    { section: 'Suspension', item_code: 'SUS-FL-001', item_name: 'Strut/shock absorber — front left', sort_order: 2000 },
    { section: 'Suspension', item_code: 'SUS-FL-002', item_name: 'Shock leakage — front left', sort_order: 2010 },
    { section: 'Suspension', item_code: 'SUS-FL-003', item_name: 'Spring — front left', sort_order: 2020 },
    { section: 'Suspension', item_code: 'SUS-FL-004', item_name: 'Spring seat — front left', sort_order: 2030 },
    { section: 'Suspension', item_code: 'SUS-FL-005', item_name: 'Strut mount — front left', sort_order: 2040 },
    { section: 'Suspension', item_code: 'SUS-FL-006', item_name: 'Strut bearing — front left', sort_order: 2050 },
    { section: 'Suspension', item_code: 'SUS-FL-007', item_name: 'Control arm — front left', sort_order: 2060 },
    { section: 'Suspension', item_code: 'SUS-FL-008', item_name: 'Control-arm bushings — front left', sort_order: 2070 },
    { section: 'Suspension', item_code: 'SUS-FL-009', item_name: 'Ball joint — front left', sort_order: 2080, is_safety_critical: true },
    { section: 'Suspension', item_code: 'SUS-FL-010', item_name: 'Stabilizer link — front left', sort_order: 2090 },
    { section: 'Suspension', item_code: 'SUS-FL-011', item_name: 'Stabilizer bush — front left', sort_order: 2100 },
    { section: 'Suspension', item_code: 'SUS-FL-012', item_name: 'Tie rod — front left', sort_order: 2110, is_safety_critical: true },
    { section: 'Suspension', item_code: 'SUS-FL-013', item_name: 'Rack end — front left', sort_order: 2120 },
    { section: 'Suspension', item_code: 'SUS-FL-014', item_name: 'Wheel bearing — front left', sort_order: 2130 },
    { section: 'Suspension', item_code: 'SUS-FL-015', item_name: 'Knuckle — front left', sort_order: 2140 },
    { section: 'Suspension', item_code: 'SUS-FL-016', item_name: 'CV axle — front left', sort_order: 2150 },
    { section: 'Suspension', item_code: 'SUS-FL-017', item_name: 'CV boot — front left', sort_order: 2160 },
    { section: 'Suspension', item_code: 'SUS-FL-018', item_name: 'Excessive play — front left', sort_order: 2170 },
    { section: 'Suspension', item_code: 'SUS-FL-019', item_name: 'Abnormal noise — front left', sort_order: 2180 },

    // FRONT RIGHT
    { section: 'Suspension', item_code: 'SUS-FR-001', item_name: 'Strut/shock absorber — front right', sort_order: 2190 },
    { section: 'Suspension', item_code: 'SUS-FR-002', item_name: 'Shock leakage — front right', sort_order: 2200 },
    { section: 'Suspension', item_code: 'SUS-FR-003', item_name: 'Spring — front right', sort_order: 2210 },
    { section: 'Suspension', item_code: 'SUS-FR-004', item_name: 'Spring seat — front right', sort_order: 2220 },
    { section: 'Suspension', item_code: 'SUS-FR-005', item_name: 'Strut mount — front right', sort_order: 2230 },
    { section: 'Suspension', item_code: 'SUS-FR-006', item_name: 'Strut bearing — front right', sort_order: 2240 },
    { section: 'Suspension', item_code: 'SUS-FR-007', item_name: 'Control arm — front right', sort_order: 2250 },
    { section: 'Suspension', item_code: 'SUS-FR-008', item_name: 'Control-arm bushings — front right', sort_order: 2260 },
    { section: 'Suspension', item_code: 'SUS-FR-009', item_name: 'Ball joint — front right', sort_order: 2270, is_safety_critical: true },
    { section: 'Suspension', item_code: 'SUS-FR-010', item_name: 'Stabilizer link — front right', sort_order: 2280 },
    { section: 'Suspension', item_code: 'SUS-FR-011', item_name: 'Stabilizer bush — front right', sort_order: 2290 },
    { section: 'Suspension', item_code: 'SUS-FR-012', item_name: 'Tie rod — front right', sort_order: 2300, is_safety_critical: true },
    { section: 'Suspension', item_code: 'SUS-FR-013', item_name: 'Rack end — front right', sort_order: 2310 },
    { section: 'Suspension', item_code: 'SUS-FR-014', item_name: 'Wheel bearing — front right', sort_order: 2320 },
    { section: 'Suspension', item_code: 'SUS-FR-015', item_name: 'Knuckle — front right', sort_order: 2330 },
    { section: 'Suspension', item_code: 'SUS-FR-016', item_name: 'CV axle — front right', sort_order: 2340 },
    { section: 'Suspension', item_code: 'SUS-FR-017', item_name: 'CV boot — front right', sort_order: 2350 },
    { section: 'Suspension', item_code: 'SUS-FR-018', item_name: 'Excessive play — front right', sort_order: 2360 },
    { section: 'Suspension', item_code: 'SUS-FR-019', item_name: 'Abnormal noise — front right', sort_order: 2370 },

    // REAR LEFT (Architecture-dependent items marked default_applicable: false)
    { section: 'Suspension', item_code: 'SUS-RL-001', item_name: 'Strut/shock absorber — rear left', sort_order: 2380 },
    { section: 'Suspension', item_code: 'SUS-RL-002', item_name: 'Shock leakage — rear left', sort_order: 2390 },
    { section: 'Suspension', item_code: 'SUS-RL-003', item_name: 'Spring — rear left', sort_order: 2400 },
    { section: 'Suspension', item_code: 'SUS-RL-004', item_name: 'Spring seat — rear left', sort_order: 2410 },
    { section: 'Suspension', item_code: 'SUS-RL-005', item_name: 'Strut mount — rear left', sort_order: 2420 },
    { section: 'Suspension', item_code: 'SUS-RL-006', item_name: 'Strut bearing — rear left', sort_order: 2430 },
    { section: 'Suspension', item_code: 'SUS-RL-007', item_name: 'Control arm — rear left', sort_order: 2440 },
    { section: 'Suspension', item_code: 'SUS-RL-008', item_name: 'Control-arm bushings — rear left', sort_order: 2450 },
    { section: 'Suspension', item_code: 'SUS-RL-009', item_name: 'Ball joint — rear left', sort_order: 2460 },
    { section: 'Suspension', item_code: 'SUS-RL-010', item_name: 'Stabilizer link — rear left', sort_order: 2470 },
    { section: 'Suspension', item_code: 'SUS-RL-011', item_name: 'Stabilizer bush — rear left', sort_order: 2480 },
    { section: 'Suspension', item_code: 'SUS-RL-012', item_name: 'Tie rod — rear left', sort_order: 2490, default_applicable: false },
    { section: 'Suspension', item_code: 'SUS-RL-013', item_name: 'Rack end — rear left', sort_order: 2500, default_applicable: false },
    { section: 'Suspension', item_code: 'SUS-RL-014', item_name: 'Wheel bearing — rear left', sort_order: 2510 },
    { section: 'Suspension', item_code: 'SUS-RL-015', item_name: 'Knuckle — rear left', sort_order: 2520 },
    { section: 'Suspension', item_code: 'SUS-RL-016', item_name: 'CV axle — rear left', sort_order: 2530, default_applicable: false },
    { section: 'Suspension', item_code: 'SUS-RL-017', item_name: 'CV boot — rear left', sort_order: 2540, default_applicable: false },
    { section: 'Suspension', item_code: 'SUS-RL-018', item_name: 'Excessive play — rear left', sort_order: 2550 },
    { section: 'Suspension', item_code: 'SUS-RL-019', item_name: 'Abnormal noise — rear left', sort_order: 2560 },

    // REAR RIGHT (Architecture-dependent items marked default_applicable: false)
    { section: 'Suspension', item_code: 'SUS-RR-001', item_name: 'Strut/shock absorber — rear right', sort_order: 2570 },
    { section: 'Suspension', item_code: 'SUS-RR-002', item_name: 'Shock leakage — rear right', sort_order: 2580 },
    { section: 'Suspension', item_code: 'SUS-RR-003', item_name: 'Spring — rear right', sort_order: 2590 },
    { section: 'Suspension', item_code: 'SUS-RR-004', item_name: 'Spring seat — rear right', sort_order: 2600 },
    { section: 'Suspension', item_code: 'SUS-RR-005', item_name: 'Strut mount — rear right', sort_order: 2610 },
    { section: 'Suspension', item_code: 'SUS-RR-006', item_name: 'Strut bearing — rear right', sort_order: 2620 },
    { section: 'Suspension', item_code: 'SUS-RR-007', item_name: 'Control arm — rear right', sort_order: 2630 },
    { section: 'Suspension', item_code: 'SUS-RR-008', item_name: 'Control-arm bushings — rear right', sort_order: 2640 },
    { section: 'Suspension', item_code: 'SUS-RR-009', item_name: 'Ball joint — rear right', sort_order: 2650 },
    { section: 'Suspension', item_code: 'SUS-RR-010', item_name: 'Stabilizer link — rear right', sort_order: 2660 },
    { section: 'Suspension', item_code: 'SUS-RR-011', item_name: 'Stabilizer bush — rear right', sort_order: 2670 },
    { section: 'Suspension', item_code: 'SUS-RR-012', item_name: 'Tie rod — rear right', sort_order: 2680, default_applicable: false },
    { section: 'Suspension', item_code: 'SUS-RR-013', item_name: 'Rack end — rear right', sort_order: 2690, default_applicable: false },
    { section: 'Suspension', item_code: 'SUS-RR-014', item_name: 'Wheel bearing — rear right', sort_order: 2700 },
    { section: 'Suspension', item_code: 'SUS-RR-015', item_name: 'Knuckle — rear right', sort_order: 2710 },
    { section: 'Suspension', item_code: 'SUS-RR-016', item_name: 'CV axle — rear right', sort_order: 2720, default_applicable: false },
    { section: 'Suspension', item_code: 'SUS-RR-017', item_name: 'CV boot — rear right', sort_order: 2730, default_applicable: false },
    { section: 'Suspension', item_code: 'SUS-RR-018', item_name: 'Excessive play — rear right', sort_order: 2740 },
    { section: 'Suspension', item_code: 'SUS-RR-019', item_name: 'Abnormal noise — rear right', sort_order: 2750 },

    // ==========================================================
    // SECTION 7 — STEERING
    // ==========================================================
    { section: 'Steering', item_code: 'STR-WHL-001', item_name: 'Steering wheel', sort_order: 2800 },
    { section: 'Steering', item_code: 'STR-WHL-002', item_name: 'Steering free play', sort_order: 2810 },
    { section: 'Steering', item_code: 'STR-WHL-003', item_name: 'Steering response', sort_order: 2820 },
    { section: 'Steering', item_code: 'STR-WHL-004', item_name: 'Steering centering', sort_order: 2830 },
    { section: 'Steering', item_code: 'STR-WHL-005', item_name: 'Steering vibration', sort_order: 2840 },
    { section: 'Steering', item_code: 'STR-WHL-006', item_name: 'Steering noise', sort_order: 2850 },
    { section: 'Steering', item_code: 'STR-RCK-001', item_name: 'Steering rack', sort_order: 2860 },
    { section: 'Steering', item_code: 'STR-RCK-002', item_name: 'Rack mounting', sort_order: 2870 },
    { section: 'Steering', item_code: 'STR-RCK-003', item_name: 'Rack ends', sort_order: 2880 },
    { section: 'Steering', item_code: 'STR-RCK-004', item_name: 'Tie rods', sort_order: 2890, is_safety_critical: true },
    { section: 'Steering', item_code: 'STR-COL-001', item_name: 'Steering column', sort_order: 2900 },
    { section: 'Steering', item_code: 'STR-COL-002', item_name: 'Steering joints', sort_order: 2910 },
    { section: 'Steering', item_code: 'STR-PWR-001', item_name: 'Power steering where applicable', sort_order: 2920, default_applicable: false },
    { section: 'Steering', item_code: 'STR-PWR-002', item_name: 'Power steering leakage', sort_order: 2930, default_applicable: false },
    { section: 'Steering', item_code: 'STR-PWR-003', item_name: 'Electric power steering where applicable', sort_order: 2940, default_applicable: false },
    { section: 'Steering', item_code: 'STR-WRN-001', item_name: 'Steering warning', sort_order: 2950, is_safety_critical: true },

    // ==========================================================
    // SECTION 8 — WHEELS & TYRES
    // ==========================================================
    // FRONT LEFT TYRE
    { section: 'Wheels', item_code: 'TYR-FL-001', item_name: 'Tyre brand — front left', sort_order: 3000 },
    { section: 'Wheels', item_code: 'TYR-FL-002', item_name: 'Tyre size — front left', sort_order: 3010 },
    { section: 'Wheels', item_code: 'TYR-FL-003', item_name: 'Tyre tread depth — front left', sort_order: 3020, measurement_unit: 'mm', is_safety_critical: true },
    { section: 'Wheels', item_code: 'TYR-FL-004', item_name: 'Tyre pressure — front left', sort_order: 3030, measurement_unit: 'PSI' },
    { section: 'Wheels', item_code: 'TYR-FL-005', item_name: 'Inner tread wear — front left', sort_order: 3040 },
    { section: 'Wheels', item_code: 'TYR-FL-006', item_name: 'Centre tread wear — front left', sort_order: 3050 },
    { section: 'Wheels', item_code: 'TYR-FL-007', item_name: 'Outer tread wear — front left', sort_order: 3060 },
    { section: 'Wheels', item_code: 'TYR-FL-008', item_name: 'Sidewall condition — front left', sort_order: 3070, is_safety_critical: true },
    { section: 'Wheels', item_code: 'TYR-FL-009', item_name: 'Bulge — front left', sort_order: 3080, is_safety_critical: true },
    { section: 'Wheels', item_code: 'TYR-FL-010', item_name: 'Crack — front left', sort_order: 3090, is_safety_critical: true },
    { section: 'Wheels', item_code: 'TYR-FL-011', item_name: 'Puncture — front left', sort_order: 3100 },
    { section: 'Wheels', item_code: 'TYR-FL-012', item_name: 'Repair — front left', sort_order: 3110 },
    { section: 'Wheels', item_code: 'TYR-FL-013', item_name: 'Tyre age — front left', sort_order: 3120 },

    // FRONT RIGHT TYRE
    { section: 'Wheels', item_code: 'TYR-FR-001', item_name: 'Tyre brand — front right', sort_order: 3130 },
    { section: 'Wheels', item_code: 'TYR-FR-002', item_name: 'Tyre size — front right', sort_order: 3140 },
    { section: 'Wheels', item_code: 'TYR-FR-003', item_name: 'Tyre tread depth — front right', sort_order: 3150, measurement_unit: 'mm', is_safety_critical: true },
    { section: 'Wheels', item_code: 'TYR-FR-004', item_name: 'Tyre pressure — front right', sort_order: 3160, measurement_unit: 'PSI' },
    { section: 'Wheels', item_code: 'TYR-FR-005', item_name: 'Inner tread wear — front right', sort_order: 3170 },
    { section: 'Wheels', item_code: 'TYR-FR-006', item_name: 'Centre tread wear — front right', sort_order: 3180 },
    { section: 'Wheels', item_code: 'TYR-FR-007', item_name: 'Outer tread wear — front right', sort_order: 3190 },
    { section: 'Wheels', item_code: 'TYR-FR-008', item_name: 'Sidewall condition — front right', sort_order: 3200, is_safety_critical: true },
    { section: 'Wheels', item_code: 'TYR-FR-009', item_name: 'Bulge — front right', sort_order: 3210, is_safety_critical: true },
    { section: 'Wheels', item_code: 'TYR-FR-010', item_name: 'Crack — front right', sort_order: 3220, is_safety_critical: true },
    { section: 'Wheels', item_code: 'TYR-FR-011', item_name: 'Puncture — front right', sort_order: 3230 },
    { section: 'Wheels', item_code: 'TYR-FR-012', item_name: 'Repair — front right', sort_order: 3240 },
    { section: 'Wheels', item_code: 'TYR-FR-013', item_name: 'Tyre age — front right', sort_order: 3250 },

    // REAR LEFT TYRE
    { section: 'Wheels', item_code: 'TYR-RL-001', item_name: 'Tyre brand — rear left', sort_order: 3260 },
    { section: 'Wheels', item_code: 'TYR-RL-002', item_name: 'Tyre size — rear left', sort_order: 3270 },
    { section: 'Wheels', item_code: 'TYR-RL-003', item_name: 'Tyre tread depth — rear left', sort_order: 3280, measurement_unit: 'mm', is_safety_critical: true },
    { section: 'Wheels', item_code: 'TYR-RL-004', item_name: 'Tyre pressure — rear left', sort_order: 3290, measurement_unit: 'PSI' },
    { section: 'Wheels', item_code: 'TYR-RL-005', item_name: 'Inner tread wear — rear left', sort_order: 3300 },
    { section: 'Wheels', item_code: 'TYR-RL-006', item_name: 'Centre tread wear — rear left', sort_order: 3310 },
    { section: 'Wheels', item_code: 'TYR-RL-007', item_name: 'Outer tread wear — rear left', sort_order: 3320 },
    { section: 'Wheels', item_code: 'TYR-RL-008', item_name: 'Sidewall condition — rear left', sort_order: 3330, is_safety_critical: true },
    { section: 'Wheels', item_code: 'TYR-RL-009', item_name: 'Bulge — rear left', sort_order: 3340, is_safety_critical: true },
    { section: 'Wheels', item_code: 'TYR-RL-010', item_name: 'Crack — rear left', sort_order: 3350, is_safety_critical: true },
    { section: 'Wheels', item_code: 'TYR-RL-011', item_name: 'Puncture — rear left', sort_order: 3360 },
    { section: 'Wheels', item_code: 'TYR-RL-012', item_name: 'Repair — rear left', sort_order: 3370 },
    { section: 'Wheels', item_code: 'TYR-RL-013', item_name: 'Tyre age — rear left', sort_order: 3380 },

    // REAR RIGHT TYRE
    { section: 'Wheels', item_code: 'TYR-RR-001', item_name: 'Tyre brand — rear right', sort_order: 3390 },
    { section: 'Wheels', item_code: 'TYR-RR-002', item_name: 'Tyre size — rear right', sort_order: 3400 },
    { section: 'Wheels', item_code: 'TYR-RR-003', item_name: 'Tyre tread depth — rear right', sort_order: 3410, measurement_unit: 'mm', is_safety_critical: true },
    { section: 'Wheels', item_code: 'TYR-RR-004', item_name: 'Tyre pressure — rear right', sort_order: 3420, measurement_unit: 'PSI' },
    { section: 'Wheels', item_code: 'TYR-RR-005', item_name: 'Inner tread wear — rear right', sort_order: 3430 },
    { section: 'Wheels', item_code: 'TYR-RR-006', item_name: 'Centre tread wear — rear right', sort_order: 3440 },
    { section: 'Wheels', item_code: 'TYR-RR-007', item_name: 'Outer tread wear — rear right', sort_order: 3450 },
    { section: 'Wheels', item_code: 'TYR-RR-008', item_name: 'Sidewall condition — rear right', sort_order: 3460, is_safety_critical: true },
    { section: 'Wheels', item_code: 'TYR-RR-009', item_name: 'Bulge — rear right', sort_order: 3470, is_safety_critical: true },
    { section: 'Wheels', item_code: 'TYR-RR-010', item_name: 'Crack — rear right', sort_order: 3480, is_safety_critical: true },
    { section: 'Wheels', item_code: 'TYR-RR-011', item_name: 'Puncture — rear right', sort_order: 3490 },
    { section: 'Wheels', item_code: 'TYR-RR-012', item_name: 'Repair — rear right', sort_order: 3500 },
    { section: 'Wheels', item_code: 'TYR-RR-013', item_name: 'Tyre age — rear right', sort_order: 3510 },

    // RIMS / WHEELS
    { section: 'Wheels', item_code: 'RIM-FL-001', item_name: 'Front-left rim condition', sort_order: 3520 },
    { section: 'Wheels', item_code: 'RIM-FL-002', item_name: 'Front-left bent rim', sort_order: 3530 },
    { section: 'Wheels', item_code: 'RIM-FL-003', item_name: 'Front-left cracked rim', sort_order: 3540, is_safety_critical: true },
    { section: 'Wheels', item_code: 'RIM-FL-004', item_name: 'Front-left corrosion', sort_order: 3550 },

    { section: 'Wheels', item_code: 'RIM-FR-001', item_name: 'Front-right rim condition', sort_order: 3560 },
    { section: 'Wheels', item_code: 'RIM-FR-002', item_name: 'Front-right bent rim', sort_order: 3570 },
    { section: 'Wheels', item_code: 'RIM-FR-003', item_name: 'Front-right cracked rim', sort_order: 3580, is_safety_critical: true },
    { section: 'Wheels', item_code: 'RIM-FR-004', item_name: 'Front-right corrosion', sort_order: 3590 },

    { section: 'Wheels', item_code: 'RIM-RL-001', item_name: 'Rear-left rim condition', sort_order: 3600 },
    { section: 'Wheels', item_code: 'RIM-RL-002', item_name: 'Rear-left bent rim', sort_order: 3610 },
    { section: 'Wheels', item_code: 'RIM-RL-003', item_name: 'Rear-left cracked rim', sort_order: 3620, is_safety_critical: true },
    { section: 'Wheels', item_code: 'RIM-RL-004', item_name: 'Rear-left corrosion', sort_order: 3630 },

    { section: 'Wheels', item_code: 'RIM-RR-001', item_name: 'Rear-right rim condition', sort_order: 3640 },
    { section: 'Wheels', item_code: 'RIM-RR-002', item_name: 'Rear-right bent rim', sort_order: 3650 },
    { section: 'Wheels', item_code: 'RIM-RR-003', item_name: 'Rear-right cracked rim', sort_order: 3660, is_safety_critical: true },
    { section: 'Wheels', item_code: 'RIM-RR-004', item_name: 'Rear-right corrosion', sort_order: 3670 },

    { section: 'Wheels', item_code: 'WHL-NUT-001', item_name: 'Wheel nuts', sort_order: 3680, is_safety_critical: true },
    { section: 'Wheels', item_code: 'WHL-HUB-001', item_name: 'Wheel hub', sort_order: 3690 },

    // SPARE
    { section: 'Wheels', item_code: 'TYR-SPR-001', item_name: 'Spare tyre', sort_order: 3700 },
    { section: 'Wheels', item_code: 'TYR-SPR-002', item_name: 'Spare tyre condition', sort_order: 3710 },
    { section: 'Wheels', item_code: 'TYR-SPR-003', item_name: 'Spare tyre pressure', sort_order: 3720, measurement_unit: 'PSI' },
    { section: 'Wheels', item_code: 'TYR-SPR-004', item_name: 'Jack', sort_order: 3730 },
    { section: 'Wheels', item_code: 'TYR-SPR-005', item_name: 'Wheel wrench', sort_order: 3740 },
    { section: 'Wheels', item_code: 'TYR-SPR-006', item_name: 'Emergency tools', sort_order: 3750 },

    // ==========================================================
    // SECTION 9 — ELECTRICAL & ELECTRONICS
    // ==========================================================
    // BATTERY
    { section: 'Electrical', item_code: 'ELE-BAT-001', item_name: 'Battery condition', sort_order: 3800 },
    { section: 'Electrical', item_code: 'ELE-BAT-002', item_name: 'Battery terminals', sort_order: 3810 },
    { section: 'Electrical', item_code: 'ELE-BAT-003', item_name: 'Terminal corrosion', sort_order: 3820 },
    { section: 'Electrical', item_code: 'ELE-BAT-004', item_name: 'Battery mounting', sort_order: 3830 },
    { section: 'Electrical', item_code: 'ELE-BAT-005', item_name: 'Resting voltage', sort_order: 3840, measurement_unit: 'V' },
    { section: 'Electrical', item_code: 'ELE-BAT-006', item_name: 'Cranking voltage', sort_order: 3850, measurement_unit: 'V' },
    { section: 'Electrical', item_code: 'ELE-BAT-007', item_name: 'Charging voltage', sort_order: 3860, measurement_unit: 'V' },
    { section: 'Electrical', item_code: 'ELE-BAT-008', item_name: 'Battery warning', sort_order: 3870, is_safety_critical: true },

    // STARTING / CHARGING
    { section: 'Electrical', item_code: 'ELE-STR-001', item_name: 'Starter motor', sort_order: 3880 },
    { section: 'Electrical', item_code: 'ELE-STR-002', item_name: 'Starter noise', sort_order: 3890 },
    { section: 'Electrical', item_code: 'ELE-STR-003', item_name: 'Starting delay', sort_order: 3900 },
    { section: 'Electrical', item_code: 'ELE-ALT-001', item_name: 'Alternator', sort_order: 3910 },
    { section: 'Electrical', item_code: 'ELE-ALT-002', item_name: 'Charging system', sort_order: 3920 },
    { section: 'Electrical', item_code: 'ELE-ALT-003', item_name: 'Alternator noise', sort_order: 3930 },

    // LIGHTING — INDIVIDUAL
    { section: 'Electrical', item_code: 'LGT-HL-001', item_name: 'Left headlamp', sort_order: 3940 },
    { section: 'Electrical', item_code: 'LGT-HL-002', item_name: 'Right headlamp', sort_order: 3950 },
    { section: 'Electrical', item_code: 'LGT-HB-001', item_name: 'Left high beam', sort_order: 3960 },
    { section: 'Electrical', item_code: 'LGT-HB-002', item_name: 'Right high beam', sort_order: 3970 },
    { section: 'Electrical', item_code: 'LGT-IND-001', item_name: 'Left indicator', sort_order: 3980 },
    { section: 'Electrical', item_code: 'LGT-IND-002', item_name: 'Right indicator', sort_order: 3990 },
    { section: 'Electrical', item_code: 'LGT-HAZ-001', item_name: 'Hazard lights', sort_order: 4000 },
    { section: 'Electrical', item_code: 'LGT-BRK-001', item_name: 'Left brake lamp', sort_order: 4010, is_safety_critical: true },
    { section: 'Electrical', item_code: 'LGT-BRK-002', item_name: 'Right brake lamp', sort_order: 4020, is_safety_critical: true },
    { section: 'Electrical', item_code: 'LGT-BRK-003', item_name: 'Centre brake lamp', sort_order: 4030, is_safety_critical: true },
    { section: 'Electrical', item_code: 'LGT-REV-001', item_name: 'Left reverse lamp', sort_order: 4040 },
    { section: 'Electrical', item_code: 'LGT-REV-002', item_name: 'Right reverse lamp', sort_order: 4050 },
    { section: 'Electrical', item_code: 'LGT-FOG-001', item_name: 'Left fog lamp where equipped', sort_order: 4060, default_applicable: false },
    { section: 'Electrical', item_code: 'LGT-FOG-002', item_name: 'Right fog lamp where equipped', sort_order: 4070, default_applicable: false },
    { section: 'Electrical', item_code: 'LGT-NUM-001', item_name: 'Number-plate lights', sort_order: 4080 },
    { section: 'Electrical', item_code: 'LGT-INT-001', item_name: 'Interior lights', sort_order: 4090 },
    { section: 'Electrical', item_code: 'LGT-BOT-001', item_name: 'Boot/trunk light', sort_order: 4100 },

    // ELECTRICAL CONTROLS
    { section: 'Electrical', item_code: 'ELE-WIN-001', item_name: 'Driver window', sort_order: 4110 },
    { section: 'Electrical', item_code: 'ELE-WIN-002', item_name: 'Passenger window', sort_order: 4120 },
    { section: 'Electrical', item_code: 'ELE-WIN-003', item_name: 'Rear-left window', sort_order: 4130 },
    { section: 'Electrical', item_code: 'ELE-WIN-004', item_name: 'Rear-right window', sort_order: 4140 },
    { section: 'Electrical', item_code: 'ELE-LCK-001', item_name: 'Central locking', sort_order: 4150 },
    { section: 'Electrical', item_code: 'ELE-LCK-002', item_name: 'Remote locking', sort_order: 4160 },
    { section: 'Electrical', item_code: 'ELE-LCK-003', item_name: 'Keyless entry', sort_order: 4170 },
    { section: 'Electrical', item_code: 'ELE-STR-004', item_name: 'Push-button start', sort_order: 4180 },
    { section: 'Electrical', item_code: 'ELE-MIR-001', item_name: 'Left electric mirror', sort_order: 4190 },
    { section: 'Electrical', item_code: 'ELE-MIR-002', item_name: 'Right electric mirror', sort_order: 4200 },
    { section: 'Electrical', item_code: 'ELE-MIR-003', item_name: 'Mirror folding', sort_order: 4210 },
    { section: 'Electrical', item_code: 'ELE-SET-001', item_name: 'Driver seat controls', sort_order: 4220 },
    { section: 'Electrical', item_code: 'ELE-SET-002', item_name: 'Passenger seat controls', sort_order: 4230 },
    { section: 'Electrical', item_code: 'ELE-SET-003', item_name: 'Rear seat controls where equipped', sort_order: 4240, default_applicable: false },
    { section: 'Electrical', item_code: 'ELE-SET-004', item_name: 'Seat heating where equipped', sort_order: 4250, default_applicable: false },
    { section: 'Electrical', item_code: 'ELE-SET-005', item_name: 'Seat ventilation where equipped', sort_order: 4260, default_applicable: false },
    { section: 'Electrical', item_code: 'ELE-SET-006', item_name: 'Seat memory where equipped', sort_order: 4270, default_applicable: false },
    { section: 'Electrical', item_code: 'ELE-PRF-001', item_name: 'Sunroof where equipped', sort_order: 4280, default_applicable: false },
    { section: 'Electrical', item_code: 'ELE-RLS-001', item_name: 'Boot/trunk release', sort_order: 4290 },
    { section: 'Electrical', item_code: 'ELE-RLS-002', item_name: 'Hood release', sort_order: 4300 },
    { section: 'Electrical', item_code: 'ELE-RLS-003', item_name: 'Fuel door release', sort_order: 4310 },

    // INFOTAINMENT
    { section: 'Electrical', item_code: 'INF-RAD-001', item_name: 'Radio', sort_order: 4320 },
    { section: 'Electrical', item_code: 'INF-BLU-001', item_name: 'Bluetooth', sort_order: 4330 },
    { section: 'Electrical', item_code: 'INF-USB-001', item_name: 'USB', sort_order: 4340 },
    { section: 'Electrical', item_code: 'INF-NAV-001', item_name: 'Navigation where equipped', sort_order: 4350, default_applicable: false },
    { section: 'Electrical', item_code: 'INF-TCH-001', item_name: 'Touchscreen', sort_order: 4360 },
    { section: 'Electrical', item_code: 'INF-SPK-001', item_name: 'Speakers', sort_order: 4370 },
    { section: 'Electrical', item_code: 'INF-CTL-001', item_name: 'Steering-wheel controls', sort_order: 4380 },
    { section: 'Electrical', item_code: 'INF-CAM-001', item_name: 'Reverse camera', sort_order: 4390 },
    { section: 'Electrical', item_code: 'INF-CAM-002', item_name: '360 camera where equipped', sort_order: 4400, default_applicable: false },
    { section: 'Electrical', item_code: 'INF-SEN-001', item_name: 'Parking sensors where equipped', sort_order: 4410, default_applicable: false },

    // ==========================================================
    // SECTION 10 — EXTERIOR / BODY
    // ==========================================================
    // FRONT
    { section: 'Body', item_code: 'EXT-FRT-001', item_name: 'Front bumper', sort_order: 4500 },
    { section: 'Body', item_code: 'EXT-FRT-002', item_name: 'Front grille', sort_order: 4510 },
    { section: 'Body', item_code: 'EXT-FRT-003', item_name: 'Bonnet/hood', sort_order: 4520 },
    { section: 'Body', item_code: 'EXT-FRT-004', item_name: 'Left headlamp housing', sort_order: 4530 },
    { section: 'Body', item_code: 'EXT-FRT-005', item_name: 'Right headlamp housing', sort_order: 4540 },
    { section: 'Body', item_code: 'EXT-FRT-006', item_name: 'Left fog lamp housing', sort_order: 4550, default_applicable: false },
    { section: 'Body', item_code: 'EXT-FRT-007', item_name: 'Right fog lamp housing', sort_order: 4560, default_applicable: false },
    { section: 'Body', item_code: 'EXT-FRT-008', item_name: 'Front sensors', sort_order: 4570, default_applicable: false },
    { section: 'Body', item_code: 'EXT-FRT-009', item_name: 'Front camera', sort_order: 4580, default_applicable: false },
    { section: 'Body', item_code: 'EXT-FRT-010', item_name: 'Panel gaps', sort_order: 4590 },
    { section: 'Body', item_code: 'EXT-FRT-011', item_name: 'Paint condition', sort_order: 4600 },
    { section: 'Body', item_code: 'EXT-FRT-012', item_name: 'Front accident-repair evidence', sort_order: 4610 },

    // LEFT SIDE
    { section: 'Body', item_code: 'EXT-LFT-001', item_name: 'Left front fender', sort_order: 4620 },
    { section: 'Body', item_code: 'EXT-LFT-002', item_name: 'Left front door', sort_order: 4630 },
    { section: 'Body', item_code: 'EXT-LFT-003', item_name: 'Left front door glass', sort_order: 4640 },
    { section: 'Body', item_code: 'EXT-LFT-004', item_name: 'Left front door handle', sort_order: 4650 },
    { section: 'Body', item_code: 'EXT-LFT-005', item_name: 'Left front door lock', sort_order: 4660 },
    { section: 'Body', item_code: 'EXT-LFT-006', item_name: 'Left rear door', sort_order: 4670 },
    { section: 'Body', item_code: 'EXT-LFT-007', item_name: 'Left rear door glass', sort_order: 4680 },
    { section: 'Body', item_code: 'EXT-LFT-008', item_name: 'Left rear door handle', sort_order: 4690 },
    { section: 'Body', item_code: 'EXT-LFT-009', item_name: 'Left rear door lock', sort_order: 4700 },
    { section: 'Body', item_code: 'EXT-LFT-010', item_name: 'Left rear quarter panel', sort_order: 4710 },
    { section: 'Body', item_code: 'EXT-LFT-011', item_name: 'Left mirror', sort_order: 4720 },
    { section: 'Body', item_code: 'EXT-LFT-012', item_name: 'Left side skirt', sort_order: 4730 },
    { section: 'Body', item_code: 'EXT-LFT-013', item_name: 'Left door seals', sort_order: 4740 },

    // RIGHT SIDE
    { section: 'Body', item_code: 'EXT-RGT-001', item_name: 'Right front fender', sort_order: 4750 },
    { section: 'Body', item_code: 'EXT-RGT-002', item_name: 'Right front door', sort_order: 4760 },
    { section: 'Body', item_code: 'EXT-RGT-003', item_name: 'Right front door glass', sort_order: 4770 },
    { section: 'Body', item_code: 'EXT-RGT-004', item_name: 'Right front door handle', sort_order: 4780 },
    { section: 'Body', item_code: 'EXT-RGT-005', item_name: 'Right front door lock', sort_order: 4790 },
    { section: 'Body', item_code: 'EXT-RGT-006', item_name: 'Right rear door', sort_order: 4800 },
    { section: 'Body', item_code: 'EXT-RGT-007', item_name: 'Right rear door glass', sort_order: 4810 },
    { section: 'Body', item_code: 'EXT-RGT-008', item_name: 'Right rear door handle', sort_order: 4820 },
    { section: 'Body', item_code: 'EXT-RGT-009', item_name: 'Right rear door lock', sort_order: 4830 },
    { section: 'Body', item_code: 'EXT-RGT-010', item_name: 'Right rear quarter panel', sort_order: 4840 },
    { section: 'Body', item_code: 'EXT-RGT-011', item_name: 'Right mirror', sort_order: 4850 },
    { section: 'Body', item_code: 'EXT-RGT-012', item_name: 'Right side skirt', sort_order: 4860 },
    { section: 'Body', item_code: 'EXT-RGT-013', item_name: 'Right door seals', sort_order: 4870 },

    // REAR
    { section: 'Body', item_code: 'EXT-RAR-001', item_name: 'Rear bumper', sort_order: 4880 },
    { section: 'Body', item_code: 'EXT-RAR-002', item_name: 'Trunk/tailgate', sort_order: 4890 },
    { section: 'Body', item_code: 'EXT-RAR-003', item_name: 'Left tail lamp', sort_order: 4900 },
    { section: 'Body', item_code: 'EXT-RAR-004', item_name: 'Right tail lamp', sort_order: 4910 },
    { section: 'Body', item_code: 'EXT-RAR-005', item_name: 'Rear glass', sort_order: 4920 },
    { section: 'Body', item_code: 'EXT-RAR-006', item_name: 'Rear camera', sort_order: 4930, default_applicable: false },
    { section: 'Body', item_code: 'EXT-RAR-007', item_name: 'Rear parking sensors', sort_order: 4940, default_applicable: false },
    { section: 'Body', item_code: 'EXT-RAR-008', item_name: 'Exhaust outlets', sort_order: 4950 },
    { section: 'Body', item_code: 'EXT-RAR-009', item_name: 'Rear panel gaps', sort_order: 4960 },
    { section: 'Body', item_code: 'EXT-RAR-010', item_name: 'Rear accident-repair evidence', sort_order: 4970 },

    // STRUCTURAL
    { section: 'Body', item_code: 'EXT-STR-001', item_name: 'Roof', sort_order: 4980 },
    { section: 'Body', item_code: 'EXT-STR-002', item_name: 'A-pillars', sort_order: 4990, is_safety_critical: true },
    { section: 'Body', item_code: 'EXT-STR-003', item_name: 'B-pillars', sort_order: 5000, is_safety_critical: true },
    { section: 'Body', item_code: 'EXT-STR-004', item_name: 'C-pillars', sort_order: 5010, is_safety_critical: true },
    { section: 'Body', item_code: 'EXT-STR-005', item_name: 'Structural deformation', sort_order: 5020, is_safety_critical: true },
    { section: 'Body', item_code: 'EXT-STR-006', item_name: 'Welding evidence', sort_order: 5030, is_safety_critical: true },
    { section: 'Body', item_code: 'EXT-STR-007', item_name: 'Cut-and-join evidence', sort_order: 5040, is_safety_critical: true },
    { section: 'Body', item_code: 'EXT-STR-008', item_name: 'Accident repair evidence', sort_order: 5050 },
    { section: 'Body', item_code: 'EXT-STR-009', item_name: 'Paint mismatch', sort_order: 5060 },
    { section: 'Body', item_code: 'EXT-STR-010', item_name: 'Overspray', sort_order: 5070 },
    { section: 'Body', item_code: 'EXT-STR-011', item_name: 'Corrosion/rust', sort_order: 5080, is_safety_critical: true },

    // ==========================================================
    // SECTION 11 — INTERIOR
    // ==========================================================
    // DRIVER AREA
    { section: 'Interior', item_code: 'INT-DRV-001', item_name: 'Driver seat', sort_order: 5200 },
    { section: 'Interior', item_code: 'INT-DRV-002', item_name: 'Driver seat adjustment', sort_order: 5210 },
    { section: 'Interior', item_code: 'INT-DRV-003', item_name: 'Driver seat upholstery', sort_order: 5220 },
    { section: 'Interior', item_code: 'INT-DRV-004', item_name: 'Driver seat heating where equipped', sort_order: 5230, default_applicable: false },
    { section: 'Interior', item_code: 'INT-DRV-005', item_name: 'Driver seat ventilation where equipped', sort_order: 5240, default_applicable: false },
    { section: 'Interior', item_code: 'INT-DRV-006', item_name: 'Driver seat memory where equipped', sort_order: 5250, default_applicable: false },
    { section: 'Interior', item_code: 'INT-DRV-007', item_name: 'Steering wheel', sort_order: 5260 },
    { section: 'Interior', item_code: 'INT-DRV-008', item_name: 'Instrument cluster', sort_order: 5270 },
    { section: 'Interior', item_code: 'INT-DRV-009', item_name: 'Dashboard', sort_order: 5280 },
    { section: 'Interior', item_code: 'INT-DRV-010', item_name: 'Dashboard controls', sort_order: 5290 },
    { section: 'Interior', item_code: 'INT-DRV-011', item_name: 'Gear selector', sort_order: 5300 },
    { section: 'Interior', item_code: 'INT-DRV-012', item_name: 'Centre console', sort_order: 5310 },

    // PASSENGER AREA
    { section: 'Interior', item_code: 'INT-PAS-001', item_name: 'Passenger seat', sort_order: 5320 },
    { section: 'Interior', item_code: 'INT-PAS-002', item_name: 'Passenger seat adjustment', sort_order: 5330 },
    { section: 'Interior', item_code: 'INT-PAS-003', item_name: 'Passenger seat upholstery', sort_order: 5340 },
    { section: 'Interior', item_code: 'INT-PAS-004', item_name: 'Passenger seat heating', sort_order: 5350, default_applicable: false },
    { section: 'Interior', item_code: 'INT-PAS-005', item_name: 'Passenger seat ventilation', sort_order: 5360, default_applicable: false },
    { section: 'Interior', item_code: 'INT-PAS-006', item_name: 'Passenger seat memory', sort_order: 5370, default_applicable: false },

    // REAR
    { section: 'Interior', item_code: 'INT-RAR-001', item_name: 'Rear seats', sort_order: 5380 },
    { section: 'Interior', item_code: 'INT-RAR-002', item_name: 'Rear seat adjustment where applicable', sort_order: 5390, default_applicable: false },
    { section: 'Interior', item_code: 'INT-RAR-003', item_name: 'Rear seat upholstery', sort_order: 5400 },

    // GENERAL
    { section: 'Interior', item_code: 'INT-GEN-001', item_name: 'Headliner', sort_order: 5420 },
    { section: 'Interior', item_code: 'INT-GEN-002', item_name: 'Floor carpet', sort_order: 5430 },
    { section: 'Interior', item_code: 'INT-GEN-003', item_name: 'Floor mats', sort_order: 5440 },
    { section: 'Interior', item_code: 'INT-GEN-004', item_name: 'Door panels', sort_order: 5450 },
    { section: 'Interior', item_code: 'INT-GEN-005', item_name: 'Interior trim', sort_order: 5460 },
    { section: 'Interior', item_code: 'INT-GEN-006', item_name: 'Boot/trunk interior', sort_order: 5470 },
    { section: 'Interior', item_code: 'INT-GEN-007', item_name: 'Interior odour', sort_order: 5480 },
    { section: 'Interior', item_code: 'INT-GEN-008', item_name: 'Water damage', sort_order: 5490 },
    { section: 'Interior', item_code: 'INT-GEN-009', item_name: 'Smoke damage', sort_order: 5500 },
    { section: 'Interior', item_code: 'INT-GEN-010', item_name: 'Evidence of modification', sort_order: 5510 },

    // DOORS (Individual checks per door)
    // Driver Door
    { section: 'Interior', item_code: 'INT-DOR-DD-001', item_name: 'Driver door operation', sort_order: 5520 },
    { section: 'Interior', item_code: 'INT-DOR-DD-002', item_name: 'Driver door hinge', sort_order: 5530 },
    { section: 'Interior', item_code: 'INT-DOR-DD-003', item_name: 'Driver door lock', sort_order: 5540 },
    { section: 'Interior', item_code: 'INT-DOR-DD-004', item_name: 'Driver door handle', sort_order: 5550 },
    { section: 'Interior', item_code: 'INT-DOR-DD-005', item_name: 'Driver door glass', sort_order: 5560 },
    { section: 'Interior', item_code: 'INT-DOR-DD-006', item_name: 'Driver door trim', sort_order: 5570 },
    { section: 'Interior', item_code: 'INT-DOR-DD-007', item_name: 'Driver door seal', sort_order: 5580 },
    { section: 'Interior', item_code: 'INT-DOR-DD-008', item_name: 'Driver door water intrusion', sort_order: 5590 },

    // Passenger Door
    { section: 'Interior', item_code: 'INT-DOR-PD-001', item_name: 'Passenger door operation', sort_order: 5600 },
    { section: 'Interior', item_code: 'INT-DOR-PD-002', item_name: 'Passenger door hinge', sort_order: 5610 },
    { section: 'Interior', item_code: 'INT-DOR-PD-003', item_name: 'Passenger door lock', sort_order: 5620 },
    { section: 'Interior', item_code: 'INT-DOR-PD-004', item_name: 'Passenger door handle', sort_order: 5630 },
    { section: 'Interior', item_code: 'INT-DOR-PD-005', item_name: 'Passenger door glass', sort_order: 5640 },
    { section: 'Interior', item_code: 'INT-DOR-PD-006', item_name: 'Passenger door trim', sort_order: 5650 },
    { section: 'Interior', item_code: 'INT-DOR-PD-007', item_name: 'Passenger door seal', sort_order: 5660 },
    { section: 'Interior', item_code: 'INT-DOR-PD-008', item_name: 'Passenger door water intrusion', sort_order: 5670 },

    // Rear Left Door
    { section: 'Interior', item_code: 'INT-DOR-RL-001', item_name: 'Rear-left door operation', sort_order: 5680 },
    { section: 'Interior', item_code: 'INT-DOR-RL-002', item_name: 'Rear-left door hinge', sort_order: 5690 },
    { section: 'Interior', item_code: 'INT-DOR-RL-003', item_name: 'Rear-left door lock', sort_order: 5700 },
    { section: 'Interior', item_code: 'INT-DOR-RL-004', item_name: 'Rear-left door handle', sort_order: 5710 },
    { section: 'Interior', item_code: 'INT-DOR-RL-005', item_name: 'Rear-left door glass', sort_order: 5720 },
    { section: 'Interior', item_code: 'INT-DOR-RL-006', item_name: 'Rear-left door trim', sort_order: 5730 },
    { section: 'Interior', item_code: 'INT-DOR-RL-007', item_name: 'Rear-left door seal', sort_order: 5740 },
    { section: 'Interior', item_code: 'INT-DOR-RL-008', item_name: 'Rear-left door water intrusion', sort_order: 5750 },

    // Rear Right Door
    { section: 'Interior', item_code: 'INT-DOR-RR-001', item_name: 'Rear-right door operation', sort_order: 5760 },
    { section: 'Interior', item_code: 'INT-DOR-RR-002', item_name: 'Rear-right door hinge', sort_order: 5770 },
    { section: 'Interior', item_code: 'INT-DOR-RR-003', item_name: 'Rear-right door lock', sort_order: 5780 },
    { section: 'Interior', item_code: 'INT-DOR-RR-004', item_name: 'Rear-right door handle', sort_order: 5790 },
    { section: 'Interior', item_code: 'INT-DOR-RR-005', item_name: 'Rear-right door glass', sort_order: 5800 },
    { section: 'Interior', item_code: 'INT-DOR-RR-006', item_name: 'Rear-right door trim', sort_order: 5810 },
    { section: 'Interior', item_code: 'INT-DOR-RR-007', item_name: 'Rear-right door seal', sort_order: 5820 },
    { section: 'Interior', item_code: 'INT-DOR-RR-008', item_name: 'Rear-right door water intrusion', sort_order: 5830 },

    // ==========================================================
    // SECTION 12 — HVAC / AIR CONDITIONING
    // ==========================================================
    { section: 'HVAC', item_code: 'HVC-CMP-001', item_name: 'AC compressor', sort_order: 5900 },
    { section: 'HVAC', item_code: 'HVC-CMP-002', item_name: 'Compressor noise', sort_order: 5910 },
    { section: 'HVAC', item_code: 'HVC-CMP-003', item_name: 'Compressor operation', sort_order: 5920 },
    { section: 'HVAC', item_code: 'HVC-PRF-001', item_name: 'Cooling performance', sort_order: 5930 },
    { section: 'HVAC', item_code: 'HVC-PRF-002', item_name: 'Vent temperature', sort_order: 5940, measurement_unit: '°C' },
    { section: 'HVAC', item_code: 'HVC-REF-001', item_name: 'Refrigerant evidence', sort_order: 5950 },
    { section: 'HVAC', item_code: 'HVC-REF-002', item_name: 'Refrigerant leakage', sort_order: 5960 },
    { section: 'HVAC', item_code: 'HVC-CND-001', item_name: 'Condenser', sort_order: 5970 },
    { section: 'HVAC', item_code: 'HVC-CND-002', item_name: 'Condenser fan', sort_order: 5980 },
    { section: 'HVAC', item_code: 'HVC-EVP-001', item_name: 'Evaporator evidence', sort_order: 5990 },
    { section: 'HVAC', item_code: 'HVC-DRN-001', item_name: 'AC drain', sort_order: 6000 },
    { section: 'HVAC', item_code: 'HVC-BLW-001', item_name: 'Blower motor', sort_order: 6010 },
    { section: 'HVAC', item_code: 'HVC-BLW-002', item_name: 'Blower speed 1', sort_order: 6020 },
    { section: 'HVAC', item_code: 'HVC-BLW-003', item_name: 'Blower speed 2', sort_order: 6030 },
    { section: 'HVAC', item_code: 'HVC-BLW-004', item_name: 'Blower speed 3', sort_order: 6040 },
    { section: 'HVAC', item_code: 'HVC-BLW-005', item_name: 'Maximum blower operation', sort_order: 6050 },
    { section: 'HVAC', item_code: 'HVC-DST-001', item_name: 'Air distribution', sort_order: 6060 },
    { section: 'HVAC', item_code: 'HVC-DST-002', item_name: 'Dashboard vents', sort_order: 6070 },
    { section: 'HVAC', item_code: 'HVC-DST-003', item_name: 'Floor vents', sort_order: 6080 },
    { section: 'HVAC', item_code: 'HVC-DST-004', item_name: 'Defroster', sort_order: 6090 },
    { section: 'HVAC', item_code: 'HVC-MOD-001', item_name: 'Recirculation', sort_order: 6100 },
    { section: 'HVAC', item_code: 'HVC-MOD-002', item_name: 'Fresh-air mode', sort_order: 6110 },
    { section: 'HVAC', item_code: 'HVC-HTG-001', item_name: 'Heating performance where applicable', sort_order: 6120, default_applicable: false },

    // ==========================================================
    // SECTION 13 — SAFETY & DRIVER ASSISTANCE
    // ==========================================================
    // PASSIVE SAFETY (Individualized seat belts)
    { section: 'Safety', item_code: 'SAF-PAS-001', item_name: 'Driver seat belt', sort_order: 6200, is_safety_critical: true },
    { section: 'Safety', item_code: 'SAF-PAS-011', item_name: 'Front passenger seat belt', sort_order: 6205, is_safety_critical: true },
    { section: 'Safety', item_code: 'SAF-PAS-012', item_name: 'Rear-left seat belt', sort_order: 6212, is_safety_critical: true },
    { section: 'Safety', item_code: 'SAF-PAS-013', item_name: 'Rear-centre seat belt where equipped', sort_order: 6215, default_applicable: false, is_safety_critical: true },
    { section: 'Safety', item_code: 'SAF-PAS-014', item_name: 'Rear-right seat belt', sort_order: 6218, is_safety_critical: true },
    { section: 'Safety', item_code: 'SAF-PAS-002', item_name: 'Seat-belt warning', sort_order: 6220, is_safety_critical: true },
    { section: 'Safety', item_code: 'SAF-PAS-003', item_name: 'Airbag warning', sort_order: 6225, is_safety_critical: true },
    { section: 'Safety', item_code: 'SAF-PAS-004', item_name: 'SRS diagnostic faults', sort_order: 6230, is_safety_critical: true },
    { section: 'Safety', item_code: 'SAF-PAS-005', item_name: 'Driver airbag', sort_order: 6240, is_safety_critical: true },
    { section: 'Safety', item_code: 'SAF-PAS-006', item_name: 'Passenger airbag', sort_order: 6250, is_safety_critical: true },
    { section: 'Safety', item_code: 'SAF-PAS-007', item_name: 'Side airbags where equipped', sort_order: 6260, default_applicable: false, is_safety_critical: true },
    { section: 'Safety', item_code: 'SAF-PAS-008', item_name: 'Curtain airbags where equipped', sort_order: 6270, default_applicable: false, is_safety_critical: true },
    { section: 'Safety', item_code: 'SAF-PAS-009', item_name: 'Child-seat anchors', sort_order: 6280 },
    { section: 'Safety', item_code: 'SAF-PAS-010', item_name: 'Child locks', sort_order: 6290 },

    // ACTIVE SAFETY
    { section: 'Safety', item_code: 'SAF-ACT-001', item_name: 'ABS', sort_order: 6300, is_safety_critical: true },
    { section: 'Safety', item_code: 'SAF-ACT-002', item_name: 'Stability control', sort_order: 6310, is_safety_critical: true },
    { section: 'Safety', item_code: 'SAF-ACT-003', item_name: 'Traction control', sort_order: 6320 },
    { section: 'Safety', item_code: 'SAF-ACT-004', item_name: 'Brake assist', sort_order: 6330 },
    { section: 'Safety', item_code: 'SAF-ACT-005', item_name: 'Hill-start assist where equipped', sort_order: 6340, default_applicable: false },
    { section: 'Safety', item_code: 'SAF-ACT-006', item_name: 'Hill-descent where equipped', sort_order: 6350, default_applicable: false },
    { section: 'Safety', item_code: 'SAF-ACT-007', item_name: 'Electronic parking brake where equipped', sort_order: 6360, default_applicable: false },

    // ADAS
    { section: 'Safety', item_code: 'SAF-ADS-001', item_name: 'Blind-spot monitoring where equipped', sort_order: 6370, default_applicable: false },
    { section: 'Safety', item_code: 'SAF-ADS-002', item_name: 'Lane-departure warning where equipped', sort_order: 6380, default_applicable: false },
    { section: 'Safety', item_code: 'SAF-ADS-003', item_name: 'Lane-keeping assist where equipped', sort_order: 6390, default_applicable: false },
    { section: 'Safety', item_code: 'SAF-ADS-004', item_name: 'Adaptive cruise where equipped', sort_order: 6400, default_applicable: false },
    { section: 'Safety', item_code: 'SAF-ADS-005', item_name: 'Forward collision warning where equipped', sort_order: 6410, default_applicable: false, is_safety_critical: true },
    { section: 'Safety', item_code: 'SAF-ADS-006', item_name: 'Automatic emergency braking where equipped', sort_order: 6420, default_applicable: false, is_safety_critical: true },
    { section: 'Safety', item_code: 'SAF-ADS-007', item_name: 'Rear cross-traffic alert where equipped', sort_order: 6430, default_applicable: false },
    { section: 'Safety', item_code: 'SAF-ADS-008', item_name: 'Parking sensors where equipped', sort_order: 6440, default_applicable: false },
    { section: 'Safety', item_code: 'SAF-ADS-009', item_name: 'Reverse camera where equipped', sort_order: 6450, default_applicable: false },
    { section: 'Safety', item_code: 'SAF-ADS-010', item_name: '360 camera where equipped', sort_order: 6460, default_applicable: false },
    { section: 'Safety', item_code: 'SAF-ADS-011', item_name: 'Traffic-sign recognition where equipped', sort_order: 6470, default_applicable: false },
    { section: 'Safety', item_code: 'SAF-ADS-012', item_name: 'Driver monitoring where equipped', sort_order: 6480, default_applicable: false },

    // ==========================================================
    // SECTION 14 — DIAGNOSTICS / OBD
    // ==========================================================
    { section: 'Diagnostics', item_code: 'OBD-SCN-001', item_name: 'Scanner communication', sort_order: 6500 },
    { section: 'Diagnostics', item_code: 'OBD-SCN-002', item_name: 'VIN from scanner', sort_order: 6510 },
    { section: 'Diagnostics', item_code: 'OBD-SCN-003', item_name: 'Battery voltage', sort_order: 6520, measurement_unit: 'V' },
    { section: 'Diagnostics', item_code: 'OBD-MIL-001', item_name: 'MIL status', sort_order: 6530, is_safety_critical: true },
    { section: 'Diagnostics', item_code: 'OBD-DTC-001', item_name: 'Stored DTCs', sort_order: 6540 },
    { section: 'Diagnostics', item_code: 'OBD-DTC-002', item_name: 'Pending DTCs', sort_order: 6550 },
    { section: 'Diagnostics', item_code: 'OBD-DTC-003', item_name: 'Permanent DTCs', sort_order: 6560 },
    { section: 'Diagnostics', item_code: 'OBD-MON-001', item_name: 'Readiness monitors', sort_order: 6570 },
    { section: 'Diagnostics', item_code: 'OBD-PAR-001', item_name: 'Engine RPM', sort_order: 6580, measurement_unit: 'RPM' },
    { section: 'Diagnostics', item_code: 'OBD-PAR-002', item_name: 'Coolant temperature', sort_order: 6590, measurement_unit: '°C' },
    { section: 'Diagnostics', item_code: 'OBD-PAR-003', item_name: 'Fuel trims', sort_order: 6600, measurement_unit: '%' },
    { section: 'Diagnostics', item_code: 'OBD-PAR-004', item_name: 'MAF', sort_order: 6610, measurement_unit: 'g/s' },
    { section: 'Diagnostics', item_code: 'OBD-PAR-005', item_name: 'MAP', sort_order: 6620, measurement_unit: 'kPa' },
    { section: 'Diagnostics', item_code: 'OBD-PAR-006', item_name: 'Throttle position', sort_order: 6630, measurement_unit: '%' },
    { section: 'Diagnostics', item_code: 'OBD-PAR-007', item_name: 'O2/AF sensors', sort_order: 6640 },
    { section: 'Diagnostics', item_code: 'OBD-PAR-008', item_name: 'Misfire data', sort_order: 6650, is_safety_critical: true },
    { section: 'Diagnostics', item_code: 'OBD-PAR-009', item_name: 'Fuel pressure where tested', sort_order: 6660, measurement_unit: 'PSI', default_applicable: false },
    { section: 'Diagnostics', item_code: 'OBD-SYS-001', item_name: 'Transmission DTCs', sort_order: 6670 },
    { section: 'Diagnostics', item_code: 'OBD-SYS-002', item_name: 'ABS DTCs', sort_order: 6680 },
    { section: 'Diagnostics', item_code: 'OBD-SYS-003', item_name: 'SRS DTCs', sort_order: 6690, is_safety_critical: true },
    { section: 'Diagnostics', item_code: 'OBD-SYS-004', item_name: 'BCM DTCs', sort_order: 6700 },
    { section: 'Diagnostics', item_code: 'OBD-SYS-005', item_name: 'EPS DTCs', sort_order: 6710 },
    { section: 'Diagnostics', item_code: 'OBD-SYS-006', item_name: 'HVAC DTCs', sort_order: 6720 },
    { section: 'Diagnostics', item_code: 'OBD-SYS-007', item_name: 'ADAS DTCs', sort_order: 6730, default_applicable: false },

    // ==========================================================
    // SECTION 15 — ROAD TEST
    // ==========================================================
    // START / INITIAL
    { section: 'RoadTest', item_code: 'RDT-STR-001', item_name: 'Cold start', sort_order: 6800 },
    { section: 'RoadTest', item_code: 'RDT-STR-002', item_name: 'Starting behaviour', sort_order: 6810 },
    { section: 'RoadTest', item_code: 'RDT-STR-003', item_name: 'Idle behaviour', sort_order: 6820 },
    { section: 'RoadTest', item_code: 'RDT-STR-004', item_name: 'Warning lights', sort_order: 6830, is_safety_critical: true },

    // ACCELERATION
    { section: 'RoadTest', item_code: 'RDT-ACC-001', item_name: 'Acceleration', sort_order: 6840 },
    { section: 'RoadTest', item_code: 'RDT-ACC-002', item_name: 'Engine response', sort_order: 6850 },
    { section: 'RoadTest', item_code: 'RDT-ACC-003', item_name: 'Throttle response', sort_order: 6860 },
    { section: 'RoadTest', item_code: 'RDT-ACC-004', item_name: 'Transmission response', sort_order: 6870 },
    { section: 'RoadTest', item_code: 'RDT-ACC-005', item_name: 'Transmission shift quality', sort_order: 6880 },
    { section: 'RoadTest', item_code: 'RDT-ACC-006', item_name: 'Shift delay', sort_order: 6890 },
    { section: 'RoadTest', item_code: 'RDT-ACC-007', item_name: 'Engine noise', sort_order: 6900 },
    { section: 'RoadTest', item_code: 'RDT-ACC-008', item_name: 'Engine vibration', sort_order: 6910 },
    { section: 'RoadTest', item_code: 'RDT-ACC-009', item_name: 'Drivetrain vibration', sort_order: 6920 },

    // CRUISING
    { section: 'RoadTest', item_code: 'RDT-CRS-001', item_name: 'Straight-line stability', sort_order: 6930, is_safety_critical: true },
    { section: 'RoadTest', item_code: 'RDT-CRS-002', item_name: 'Steering centre', sort_order: 6940 },
    { section: 'RoadTest', item_code: 'RDT-CRS-003', item_name: 'Steering response', sort_order: 6950 },
    { section: 'RoadTest', item_code: 'RDT-CRS-004', item_name: 'Ride quality', sort_order: 6960 },
    { section: 'RoadTest', item_code: 'RDT-CRS-005', item_name: 'Road noise', sort_order: 6970 },
    { section: 'RoadTest', item_code: 'RDT-CRS-006', item_name: 'Vibration', sort_order: 6980 },
    { section: 'RoadTest', item_code: 'RDT-CRS-007', item_name: 'Engine behaviour', sort_order: 6990 },
    { section: 'RoadTest', item_code: 'RDT-CRS-008', item_name: 'Transmission behaviour', sort_order: 7000 },

    // BRAKING
    { section: 'RoadTest', item_code: 'RDT-BRK-001', item_name: 'Brake response', sort_order: 7010, is_safety_critical: true },
    { section: 'RoadTest', item_code: 'RDT-BRK-002', item_name: 'Straight-line braking', sort_order: 7020, is_safety_critical: true },
    { section: 'RoadTest', item_code: 'RDT-BRK-003', item_name: 'Brake pulling', sort_order: 7030, is_safety_critical: true },
    { section: 'RoadTest', item_code: 'RDT-BRK-004', item_name: 'Brake vibration', sort_order: 7040 },
    { section: 'RoadTest', item_code: 'RDT-BRK-005', item_name: 'Brake noise', sort_order: 7050 },
    { section: 'RoadTest', item_code: 'RDT-BRK-006', item_name: 'ABS behaviour', sort_order: 7060, is_safety_critical: true },

    // SUSPENSION
    { section: 'RoadTest', item_code: 'RDT-SUS-001', item_name: 'Bump response', sort_order: 7070 },
    { section: 'RoadTest', item_code: 'RDT-SUS-002', item_name: 'Pothole response', sort_order: 7080 },
    { section: 'RoadTest', item_code: 'RDT-SUS-003', item_name: 'Body movement', sort_order: 7090 },
    { section: 'RoadTest', item_code: 'RDT-SUS-004', item_name: 'Suspension noise', sort_order: 7100 },
    { section: 'RoadTest', item_code: 'RDT-SUS-005', item_name: 'Steering noise', sort_order: 7110 },
    { section: 'RoadTest', item_code: 'RDT-SUS-006', item_name: 'Drivetrain vibration', sort_order: 7120 },

    // REVERSE
    { section: 'RoadTest', item_code: 'RDT-REV-001', item_name: 'Reverse engagement', sort_order: 7130 },
    { section: 'RoadTest', item_code: 'RDT-REV-002', item_name: 'Reverse movement', sort_order: 7140 },
    { section: 'RoadTest', item_code: 'RDT-REV-003', item_name: 'Reverse camera', sort_order: 7150, default_applicable: false },
    { section: 'RoadTest', item_code: 'RDT-REV-004', item_name: 'Parking sensors', sort_order: 7160, default_applicable: false }
];
