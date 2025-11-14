-- ============================================================================
-- UNIFIED CODE SYSTEM DATABASE SCHEMA
-- ============================================================================
-- Created: 2025-11-14
-- Purpose: Two-layer hierarchical code system for construction material management
-- Source: Coding_Schema_20251113.csv (312 pack definitions)
-- Design: LAYERED_CODE_SYSTEM_DESIGN_2025-11-14.md
--
-- Layer 1: Aggregate codes for estimating/quoting (Plan-Phase/Option-MaterialClass)
-- Layer 2: Detailed material SKUs for purchasing/inventory
-- ============================================================================

-- ============================================================================
-- CORE REFERENCE TABLES
-- ============================================================================

-- Material Class Definitions
-- Defines high-level categories for material types
CREATE TABLE material_classes (
    class_code TEXT PRIMARY KEY,
    class_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO material_classes (class_code, class_name, description, sort_order) VALUES
('1000', 'Framing', 'Structural framing materials including lumber, engineered wood, fasteners', 1),
('1100', 'Siding', 'Exterior finishing materials including siding, trim, housewrap, post wraps', 2);

-- ============================================================================
-- Phase and Option Code Definitions
-- Defines all phase codes and their variants
CREATE TABLE phase_option_definitions (
    code_id INTEGER PRIMARY KEY AUTOINCREMENT,
    phase_code TEXT NOT NULL UNIQUE,
    phase_name TEXT NOT NULL,
    is_base_phase BOOLEAN DEFAULT 0,
    is_option BOOLEAN DEFAULT 1,
    is_alpha_variant BOOLEAN DEFAULT 0,
    material_class TEXT NOT NULL,
    shipping_order INTEGER,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_class) REFERENCES material_classes(class_code)
);

-- Base Phase Codes (Foundation through Siding)
INSERT INTO phase_option_definitions (phase_code, phase_name, is_base_phase, is_option, is_alpha_variant, material_class, shipping_order, description) VALUES
-- 09 Series - Basement Walls
('09.00', 'WO BASEMENT WALLS', 1, 1, 0, '1000', 1, 'Walk-out basement wall framing'),
('09.20', 'WO BASEMENT WALLS 2', 0, 1, 0, '1000', 1, 'Walk-out basement wall framing variant 2'),

-- 10 Series - Foundation
('10.00', 'FOUNDATION', 1, 0, 0, '1000', 1, 'Standard foundation framing'),
('10.01', 'OPT FOUNDATION', 0, 1, 0, '1000', 1, 'Optional foundation with fireplace - FPSING01'),
('10.60', 'EXTENDED GREAT ROOM FOUNDATION', 0, 1, 0, '1000', 1, 'Extended great room foundation - XGREAT'),
('10.61', 'SUNROOM FOUNDATION', 0, 1, 0, '1000', 1, 'Sunroom foundation - SUN'),
('10.82', 'OPT DEN FOUNDATION', 0, 1, 0, '1000', 1, 'Optional den foundation'),
('10.83', 'OPT DEN W/FULL BATH FOUNDATION', 0, 1, 0, '1000', 1, 'Optional den with full bathroom foundation'),
('10.tc', 'TALLCRAWL FRAMING', 0, 1, 1, '1000', 1, 'Tall crawl space framing - TALLCRWL'),

-- 11 Series - Main Joist System @ Foundation
('11.00', 'MAIN JOIST SYSTEM @FOUNDATION', 1, 0, 0, '1000', 1, 'Main floor joist system at foundation level'),
('11.01', 'MAIN JOIST SYSTEM FIREPLACE ADD ON @FOUNDATION', 0, 1, 0, '1000', 1, 'Fireplace add-on joist system - FPSING'),
('11.60', 'MAIN JOIST SYSTEM @ EXTENDED GREAT ROOM', 0, 1, 0, '1000', 1, 'Extended great room joist system - XGREAT'),
('11.62', 'MAIN JOIST SYSTEM LOFT 2 ADD ON @FOUNDATION', 0, 1, 0, '1000', 1, 'Loft 2 add-on joist system - LOFT2'),

-- 12 Series - Garage Foundation
('12.00', 'OPT 3RD CAR GARAGE FOUNDATION', 0, 1, 0, '1000', 1, 'Third car garage foundation - 3CARA/B/C'),
('12.2x', 'OPT 2 CAR GARAGE 2\' EXT FOUNDATION', 0, 1, 1, '1000', 1, '2-car garage 2-foot extension - GAREXT2'),
('12.4x', 'OPT 2 CAR GARAGE 4\' EXT FOUNDATION', 0, 1, 1, '1000', 1, '2-car garage 4-foot extension - 2CAR4XA/B/C'),
('12.5x', 'OPT 2 CAR GARAGE 5\' EXT FOUNDATION', 0, 1, 1, '1000', 1, '2-car garage 5-foot extension - 2CAR5XA/B/C'),
('12.40', 'OPT 4 CAR GARAGE TANDEM FOUNDATION', 0, 1, 0, '1000', 1, '4-car tandem garage foundation - 4CARTA/B/C'),

-- 13 Series - Covered Patio Foundation
('13.10', 'COVERED PATIO FOUNDATION', 0, 1, 0, '1000', 1, 'Covered patio foundation option 1 - COVP'),
('13.20', 'COVERED PATIO 2 FOUNDATION', 0, 1, 0, '1000', 1, 'Covered patio foundation option 2 - COVP2'),
('13.30', 'COVERED PATIO 3 FOUNDATION', 0, 1, 0, '1000', 1, 'Covered patio foundation option 3 - COVP3'),

-- 14 Series - Deck Foundation
('14.10', 'DECK FOUNDATION', 0, 1, 0, '1000', 1, 'Deck foundation option 1 - DECK'),
('14.20', 'DECK FOUNDATION 2', 0, 1, 0, '1000', 1, 'Deck foundation option 2 - DECK2'),
('14.30', 'DECK FOUNDATION 3', 0, 1, 0, '1000', 1, 'Deck foundation option 3 - DECK3'),

-- 15 Series - Covered Deck Foundation
('15.10', 'COVERED DECK FOUNDATION', 0, 1, 0, '1000', 1, 'Covered deck foundation option 1 - COVD'),
('15.20', 'COVERED DECK FOUNDATION 2', 0, 1, 0, '1000', 1, 'Covered deck foundation option 2 - COVD2'),
('15.30', 'COVERED DECK FOUNDATION 3', 0, 1, 0, '1000', 1, 'Covered deck foundation option 3 - COVD3'),

-- 16 Series - Main Floor Over Basement
('16.10', 'TRUSSED MAIN FLOOR OVER BASEMENT', 0, 1, 0, '1000', 1, 'Trussed main floor over walkout basement - WO'),
('16.20', 'OPT WO BASEMENT MAIN FLOOR SYSTEM', 0, 1, 0, '1000', 1, 'Walkout basement floor system - WO/WO2'),
('16.61', 'WO BSMT MAIN FLOOR', 0, 1, 0, '1000', 1, 'Walkout basement with sunroom - SUNWO'),

-- 18 Series - Main Subfloor
('18.00', 'MAIN SUBFLOOR', 1, 0, 0, '1000', 2, 'Main floor subfloor decking'),
('18.82', 'OPT DEN SUBFLOOR', 0, 1, 0, '1000', 2, 'Optional den subfloor'),
('18.83', 'OPT DEN W/FULL BATH SUBFLOOR', 0, 1, 0, '1000', 2, 'Optional den with full bathroom subfloor'),

-- 20 Series - Main Floor Walls
('20.00', 'MAIN FLOOR WALLS', 1, 0, 0, '1000', 3, 'Main floor wall framing'),
('20.01', 'OPT DBL SIDED FIREPLACE', 0, 1, 0, '1000', 3, 'Optional double-sided fireplace'),
('20.02', 'OPT GREAT ROOM WINDOWS', 0, 1, 0, '1000', 3, 'Optional great room windows - WDWGREAT/WDWGRALT/WDWGRTX'),
('20.06', 'OPT FLEX WINDOW', 0, 1, 0, '1000', 3, 'Optional flex room window'),
('20.12', 'OPT CENTER MEET DOOR', 0, 1, 0, '1000', 3, 'Optional center-meet sliding door - MSLIDE1'),
('20.13', 'OPT MULTI SLIDE DOOR', 0, 1, 0, '1000', 3, 'Optional multi-slide door - MSLIDE2'),
('20.14', 'OPT BEDROOM 2 WINDOW', 0, 1, 0, '1000', 3, 'Optional bedroom 2 window - WDWBR2'),
('20.15', 'OPT BEDROOM 3 WINDOW', 0, 1, 0, '1000', 3, 'Optional bedroom 3 window - WDWBR3'),
('20.16', 'OPT BEDROOM 4 WINDOW', 0, 1, 0, '1000', 3, 'Optional bedroom 4 window - WDWBR4'),
('20.17', 'OPT BEDROOM 5 WINDOW', 0, 1, 0, '1000', 3, 'Optional bedroom 5 window - WDWBR5'),
('20.19', 'OPT STUDY WINDOW', 0, 1, 0, '1000', 3, 'Optional study window - WDWSTUDY'),
('20.20', 'OPT POWDER ROOM', 0, 1, 0, '1000', 3, 'Optional powder room - ABAPWDR'),
('20.21', 'OPT DBA DELUXE MASTER BATH 1', 0, 1, 0, '1000', 3, 'Deluxe master bath option 1 - DBA'),
('20.22', 'OPT DBA2 DELUXE MASTER BATH 2', 0, 1, 0, '1000', 3, 'Deluxe master bath option 2 - DBA2'),
('20.23', 'OPT DBA3 DELUXE MASTER BATH 3', 0, 1, 0, '1000', 3, 'Deluxe master bath option 3 - DBA3'),
('20.24', 'OPT BEDROOM 4', 0, 1, 0, '1000', 3, 'Optional bedroom 4 - ABR4/ABR4BA'),
('20.25', 'OPT BEDROOM 5 W/ BATHROOM', 0, 1, 0, '1000', 3, 'Optional bedroom 5 with bathroom - ABR5BA'),
('20.27', 'OPT STUDY', 0, 1, 0, '1000', 3, 'Optional study - STUDY'),
('20.28', 'OPT DINING ROOM', 0, 1, 0, '1000', 3, 'Optional dining room'),
('20.29', 'OPT BED W/ BATHROOM ILO DEN', 0, 1, 0, '1000', 3, 'Optional bedroom with bath in lieu of den'),
('20.2l', 'OPT CENTER MEET DOOR @ LOFT', 0, 1, 1, '1000', 3, 'Optional center-meet door at loft - MSLIDE1'),
('20.33', 'OPT FRENCH DOUBLE DOOR', 0, 1, 0, '1000', 3, 'Optional French double door - FRENCHDB'),
('20.34', 'OPT POCKET OFFICE', 0, 1, 0, '1000', 3, 'Optional pocket office'),
('20.3l', 'OPT MULTI SLIDE DOOR @ LOFT', 0, 1, 1, '1000', 3, 'Optional multi-slide door at loft - MSLIDE2'),
('20.41', 'OPT DINING ROOM COFFERED CEILING', 0, 1, 0, '1000', 3, 'Dining room coffered ceiling - COFDIN'),
('20.42', 'OPT MBR COFFERED CEILING', 0, 1, 0, '1000', 3, 'Master bedroom coffered ceiling - COFMBR'),
('20.43', 'OPT ENTRY COFFERED CEILING', 0, 1, 0, '1000', 3, 'Entry coffered ceiling'),
('20.44', 'OPT LIVING ROOM COFFERED CEILING', 0, 1, 0, '1000', 3, 'Living room coffered ceiling'),
('20.50', 'OPT BOOKCASE STUDY', 0, 1, 0, '1000', 3, 'Optional bookcase in study - BOOK1'),
('20.60', 'EXTENDED GREAT ROOM WALLS', 0, 1, 0, '1000', 3, 'Extended great room walls - XGREAT'),
('20.61', 'MAIN WALLS SUNROOM', 0, 1, 0, '1000', 3, 'Sunroom main walls - SUN'),
('20.70', 'MAIN WALL OPT BDR 3', 0, 1, 0, '1000', 3, 'Optional bedroom 3 main walls'),
('20.81', 'OPT CLUBHOUSE RETREAT', 0, 1, 0, '1000', 3, 'Optional clubhouse retreat - RETREAT'),
('20.82', 'OPT DEN WALLS', 0, 1, 0, '1000', 3, 'Optional den walls'),
('20.83', 'OPT DEN W/FULL BATH WALLS', 0, 1, 0, '1000', 3, 'Optional den with full bathroom walls'),
('20.ak', 'ALTERNATE KITCHEN', 0, 1, 1, '1000', 3, 'Alternate kitchen layout'),
('20.lo', 'MAIN FLOOR WALLS (LOFT)', 0, 1, 1, '1000', 3, 'Main floor walls with loft'),
('20.ma', 'FRAMING MASONRY', 0, 1, 1, '1000', 3, 'Masonry framing'),
('20.nl', 'MAIN FLOOR WALLS (NO LOFT)', 0, 1, 1, '1000', 3, 'Main floor walls without loft'),
('20.rf', 'MAIN WALLS READYFRAME', 0, 1, 1, '1000', 3, 'Main walls ReadyFrame system'),

-- 22 Series - Garage Walls
('22.00', '3RD CAR GARAGE WALLS', 0, 1, 0, '1000', 3, 'Third car garage wall framing'),
('22.2x', 'OPT EXTENDED GARAGE WALLS', 0, 1, 1, '1000', 3, 'Extended garage walls - GAREXT2'),
('22.4x', 'OPT 2 CAR GARAGE 4\' EXT WALLS', 0, 1, 1, '1000', 3, '2-car garage 4-foot extension walls - 2CAR4XA/B/C'),
('22.5x', 'OPT 2 CAR GARAGE 5\' EXT WALLS', 0, 1, 1, '1000', 3, '2-car garage 5-foot extension walls - 2CAR5XA/B/C'),
('22.40', 'OPT 4 CAR GARAGE TANDEM WALLS', 0, 1, 0, '1000', 3, '4-car tandem garage walls - 4CARTA/B/C'),

-- 23 Series - Covered Patio Framing
('23.00', 'COVERED PATIO', 0, 1, 0, '1000', 3, 'Covered patio framing - COVP'),
('23.10', 'COVERED PATIO 1', 0, 1, 0, '1000', 3, 'Covered patio option 1 - COVP'),
('23.20', 'COVERED PATIO 2', 0, 1, 0, '1000', 3, 'Covered patio option 2 - COVP2'),
('23.30', 'COVERED PATIO 3', 0, 1, 0, '1000', 3, 'Covered patio option 3 - COVP3'),
('23.61', 'SUNROOM COVERED PATIO', 0, 1, 0, '1000', 3, 'Sunroom covered patio - COVPSN1'),
('23.sr', 'COVERED PATIO @ SUNROOM', 0, 1, 1, '1000', 3, 'Covered patio at sunroom - SUN/SUNWO/COVPSN1'),
('23.xc', 'EXTENDED COVERED PATIO', 0, 1, 1, '1000', 3, 'Extended covered patio - COVPX'),

-- 24 Series - Deck Framing
('24.00', 'DECK FRAMING', 0, 1, 0, '1000', 3, 'Deck framing - WO'),
('24.10', 'DECK FRAMING 1', 0, 1, 0, '1000', 3, 'Deck framing option 1 - DECK'),
('24.20', 'DECK FRAMING 2', 0, 1, 0, '1000', 3, 'Deck framing option 2 - DECK2'),
('24.30', 'DECK FRAMING 3', 0, 1, 0, '1000', 3, 'Deck framing option 3 - DECK3'),
('24.60', 'DECK FRAMING @ EXT GRT RM WALKOUT', 0, 1, 0, '1000', 3, 'Deck at extended great room - XGREAT/COVD2/WO2'),
('24.ed', 'EXT DECK FRAMING', 0, 1, 1, '1000', 3, 'Extended deck framing - COVD2/WO'),
('24.sr', 'DECK FRAMING @ SUNROOM', 0, 1, 1, '1000', 3, 'Deck at sunroom - SUN/COVD1SN/SUNWO'),

-- 25 Series - Covered Deck Framing
('25.10', 'COVERED DECK FRAMING', 0, 1, 0, '1000', 3, 'Covered deck framing option 1 - COVD'),
('25.1s', 'COVERED DECK STAIR FRAMING', 0, 1, 1, '1000', 3, 'Covered deck stair framing - COVD'),
('25.20', 'COVERED DECK FRAMING 2', 0, 1, 0, '1000', 3, 'Covered deck framing option 2 - COVD2'),
('25.30', 'COVERED DECK FRAMING 3', 0, 1, 0, '1000', 3, 'Covered deck framing option 3 - COVD3'),
('25.tc', 'DECK FRAMING TALLCRAWL', 0, 1, 1, '1000', 3, 'Deck framing for tall crawl - TALLCRWL'),

-- 27 Series - Shaftliner
('27.00', 'MAIN FLOOR SHAFTLINER', 0, 1, 0, '1000', 3, 'Main floor shaftliner'),

-- 30 Series - 2nd Floor System
('30.00', '2ND FLOOR SYSTEM', 1, 0, 0, '1000', 3, 'Second floor joist system'),
('30.21', 'OPT DBA DELUXE MASTER BATH 1 2ND FLR', 0, 1, 0, '1000', 3, 'Deluxe master bath option 1 - DBA'),
('30.22', 'OPT DBA2 DELUXE MASTER BATH 2 2ND FLR', 0, 1, 0, '1000', 3, 'Deluxe master bath option 2 - DBA2'),
('30.62', 'OPT LOFT2 2ND FLOOR SYSTEM', 0, 1, 0, '1000', 3, 'Loft 2 second floor system - LOFT2'),
('30.nl', '2ND FLOOR SYSTEM (NO LOFT)', 0, 1, 1, '1000', 3, 'Second floor system without loft'),

-- 32 Series - 2nd Floor Subfloor
('32.00', '2ND FLOOR SUBFLOOR', 1, 0, 0, '1000', 4, 'Second floor subfloor decking'),
('32.62', 'OPT LOFT2 2ND FLOOR SUBFLOOR', 0, 1, 0, '1000', 4, 'Loft 2 subfloor - LOFT2'),
('32.lo', '2ND FLOOR DECKING (LOFT)', 0, 1, 1, '1000', 4, 'Second floor decking with loft'),

-- 34 Series - 2nd Floor Walls
('34.00', '2ND FLOOR DECKING & WALLS', 1, 0, 0, '1000', 4, 'Second floor wall framing'),
('34.10', 'OPT BATHROOM 2 WINDOW', 0, 1, 0, '1000', 4, 'Optional bathroom 2 window'),
('34.11', 'OPT MASTER BEDROOM WINDOW(S)', 0, 1, 0, '1000', 4, 'Optional master bedroom windows - WDWMBR'),
('34.14', 'OPT BEDROOM 2 WINDOW 2ND FLR', 0, 1, 0, '1000', 4, 'Optional bedroom 2 window - WDWBR2'),
('34.15', 'OPT BEDROOM 3 WINDOW 2ND FLR', 0, 1, 0, '1000', 4, 'Optional bedroom 3 window - WDWBR3'),
('34.16', 'OPT BATHROOM 2 WINDOW 2ND FLR', 0, 1, 0, '1000', 4, 'Optional bathroom 2 window - WDWBA2'),
('34.21', 'OPT DBA DELUXE MASTER BATH 1 WALLS', 0, 1, 0, '1000', 4, 'Deluxe master bath 1 walls - DBA'),
('34.22', 'OPT DBA2 DELUXE MASTER BATH 2 WALLS', 0, 1, 0, '1000', 4, 'Deluxe master bath 2 walls - DBA2'),
('34.23', 'OPT DELUXE MBA1', 0, 1, 0, '1000', 4, 'Optional deluxe master bath 1'),
('34.24', 'OPT BEDROOM 4 2ND FLR', 0, 1, 0, '1000', 4, 'Optional bedroom 4 - ABR4'),
('34.25', 'OPT BEDROOM 5 2ND FLR', 0, 1, 0, '1000', 4, 'Optional bedroom 5 - ABR5/ABR5BA3/ABR5BA4'),
('34.26', 'OPT BEDROOM 6 W/ BATHROOM', 0, 1, 0, '1000', 4, 'Optional bedroom 6 with bathroom - ABR6'),
('34.27', 'OPT MBR SITTING', 0, 1, 0, '1000', 4, 'Optional master bedroom sitting area - SITTING'),
('34.61', 'LOFT BECOMES BEDROOM', 0, 1, 0, '1000', 4, 'Loft converted to bedroom'),
('34.62', 'OPT LOFT2 2ND FLOOR WALLS', 0, 1, 0, '1000', 4, 'Loft 2 walls - LOFT2'),
('34.80', 'OPT RETREAT', 0, 1, 0, '1000', 4, 'Optional retreat'),
('34.9t', '2ND FLOOR WALLS 9\' CEILING', 0, 1, 1, '1000', 4, 'Second floor 9-foot ceiling - 92L'),
('34.lp', '2ND FLOOR WALLS (LOFT)', 0, 1, 1, '1000', 4, 'Second floor walls with loft'),
('34.nl', '2ND FLOOR WALLS (NO LOFT)', 0, 1, 1, '1000', 4, 'Second floor walls without loft'),
('34.rf', '2ND FLOOR WALLS READYFRAME', 0, 1, 1, '1000', 4, 'Second floor ReadyFrame walls'),

-- 40 Series - Roof
('40.00', 'ROOF', 1, 0, 0, '1000', 5, 'Main roof framing and sheathing'),
('40.60', 'EXTENDED GREAT ROOM ROOF', 0, 1, 0, '1000', 5, 'Extended great room roof - XGREAT/WO2'),
('40.61', 'ROOF SUNROOM', 0, 1, 0, '1000', 5, 'Sunroom roof - SUN'),
('40.80', 'OPT BUILD-OUT ROOF', 0, 1, 0, '1000', 5, 'Optional build-out roof'),
('40.gs', 'ROOF GABLE SHEETING', 0, 1, 1, '1000', 5, 'Roof gable sheathing'),

-- 42 Series - Garage Roof
('42.00', 'OPT 3RD CAR GARAGE ROOF', 0, 1, 0, '1000', 5, 'Third car garage roof - 3CARA/B/C'),
('42.4x', 'OPT 2 CAR GARAGE 4\' EXT ROOF', 0, 1, 1, '1000', 5, '2-car garage 4-foot extension roof - 2CAR4XA/B/C'),
('42.5x', 'OPT 2 CAR GARAGE 5\' EXT ROOF', 0, 1, 1, '1000', 5, '2-car garage 5-foot extension roof - 2CAR5XA/B/C'),
('42.40', 'OPT 4 CAR GARAGE TANDEM ROOF', 0, 1, 0, '1000', 5, '4-car tandem garage roof - 4CARTA/B/C'),

-- 43 Series - Covered Patio Roof
('43.00', 'COVERED PATIO ROOF', 0, 1, 0, '1000', 5, 'Covered patio roof - COVP'),
('43.10', 'OPT COVERED PATIO 1 ROOF', 0, 1, 0, '1000', 5, 'Covered patio 1 roof'),
('43.20', 'OPT COVERED PATIO 2 ROOF', 0, 1, 0, '1000', 5, 'Covered patio 2 roof - COVP2'),
('43.30', 'OPT COVERED PATIO 3 ROOF', 0, 1, 0, '1000', 5, 'Covered patio 3 roof - COVD3/COVP3'),
('43.61', 'SUNROOM COVERED PATIO ROOF', 0, 1, 0, '1000', 5, 'Sunroom covered patio roof - COVPSN1'),
('43.sr', 'COVERED PATIO @ SUNROOM ROOF', 0, 1, 1, '1000', 5, 'Covered patio at sunroom roof - COVPSN1/COVD1SN'),
('43.xc', 'EXTENDED COVERED PATIO ROOF', 0, 1, 1, '1000', 5, 'Extended covered patio roof - COVPX'),

-- 45 Series - Covered Deck Roof
('45.00', 'EXT COVERED PATIO', 0, 1, 0, '1000', 5, 'Extended covered patio'),
('45.10', 'OPT COVERED DECK ROOF', 0, 1, 0, '1000', 5, 'Covered deck roof option 1 - COVD'),
('45.20', 'OPT COVERED DECK 2 ROOF', 0, 1, 0, '1000', 5, 'Covered deck roof option 2 - COVD2'),
('45.30', 'OPT COVERED DECK 3 ROOF', 0, 1, 0, '1000', 5, 'Covered deck roof option 3 - COVD3'),

-- 58 Series - Housewrap
('58.00', 'HOUSEWRAP', 1, 0, 0, '1100', 6, 'Exterior building wrap'),

-- 60 Series - Exterior Trim and Siding
('60.00', 'EXTERIOR TRIM AND SIDING', 1, 0, 0, '1100', 7, 'Main exterior siding and trim'),
('60.02', 'OPT GREAT ROOM WINDOWS SIDING', 0, 1, 0, '1100', 7, 'Great room window siding - WDWGREAT/WDWGRALT'),
('60.0x', 'OPT GREAT ROOM WINDOW(S) @ EXT GRT RM', 0, 1, 1, '1100', 7, 'Great room windows at extension - WDWGRTX'),
('60.11', 'OPT MASTER BEDROOM WINDOWS SIDING', 0, 1, 0, '1100', 7, 'Master bedroom window siding - WDWMBR'),
('60.12', 'OPT CENTER MEET DOOR SIDING', 0, 1, 0, '1100', 7, 'Center-meet door siding - MSLIDE1'),
('60.13', 'OPT 12\' MULTI SLIDE SIDING', 0, 1, 0, '1100', 7, 'Multi-slide door siding - MSLIDE2'),
('60.14', 'OPT BEDROOM 2 WINDOW SIDING', 0, 1, 0, '1100', 7, 'Bedroom 2 window siding - WDWBR2'),
('60.15', 'OPT BEDROOM 3 WINDOW SIDING', 0, 1, 0, '1100', 7, 'Bedroom 3 window siding - WDWBR3'),
('60.16', 'OPT BEDROOM 4 WINDOW SIDING', 0, 1, 0, '1100', 7, 'Bedroom 4 window siding - WDWBR4'),
('60.17', 'OPT BEDROOM 5 WINDOW SIDING', 0, 1, 0, '1100', 7, 'Bedroom 5 window siding - WDWBR5'),
('60.19', 'OPT STUDY WINDOW SIDING', 0, 1, 0, '1100', 7, 'Study window siding - WDWSTUDY'),
('60.21', 'OPT DBA DELUXE MASTER BATH 1 SIDING', 0, 1, 0, '1100', 7, 'Deluxe master bath 1 siding - DBA'),
('60.22', 'OPT DBA2 DELUXE MASTER BATH 2 SIDING', 0, 1, 0, '1100', 7, 'Deluxe master bath 2 siding - DBA2'),
('60.24', 'OPT BEDROOM 4 SIDING', 0, 1, 0, '1100', 7, 'Bedroom 4 siding - ABR4BA'),
('60.27', 'OPT MBR SITTING SIDING', 0, 1, 0, '1100', 7, 'Master bedroom sitting area siding - SITTING'),
('60.6x', 'EXTENDED GREAT ROOM SIDING', 0, 1, 1, '1100', 7, 'Extended great room siding - XGREAT/WO2'),
('60.61', 'SIDING SUNROOM', 0, 1, 0, '1100', 7, 'Sunroom siding - SUN'),
('60.80', 'OPT BUILD-OUT SIDING', 0, 1, 0, '1100', 7, 'Optional build-out siding'),
('60.ec', 'EXTERIOR TRIM AND SIDING CORNER ENHANCED', 0, 1, 1, '1100', 7, 'Enhanced corner trim and siding'),
('60.er', 'EXTERIOR TRIM AND SIDING REAR ENHANCED', 0, 1, 1, '1100', 7, 'Enhanced rear trim and siding'),
('60.fw', 'FAUX WOOD', 0, 1, 1, '1100', 7, 'Faux wood trim'),
('60.ma', 'EXTERIOR TRIM AND SIDING MASONRY', 0, 1, 1, '1100', 7, 'Masonry exterior trim and siding'),
('60.pr', 'PORCH RAIL', 0, 1, 1, '1100', 7, 'Porch railing - PORRAIL'),
('60.pw', 'EXTERIOR POST WRAP', 0, 1, 1, '1100', 7, 'Exterior post wraps'),
('60.tc', 'SIDING TALLCRAWL', 0, 1, 1, '1100', 7, 'Tall crawl siding - TLLCRWL'),

-- 62 Series - Garage Siding
('62.00', '3RD CAR GARAGE SIDING AND TRIM', 0, 1, 0, '1100', 7, 'Third car garage siding - 3CARA/B/C'),
('62.2x', 'OPT EXTENDED GARAGE SIDING', 0, 1, 1, '1100', 7, 'Extended garage siding - 2CAR4XA/B/C'),
('62.4x', 'OPT 2 CAR GARAGE 4\' EXT SIDING', 0, 1, 1, '1100', 7, '2-car garage 4-foot extension siding - 2CAR4XA/B/C'),
('62.5x', '2 CAR GARAGE 5\' EXT SIDING', 0, 1, 1, '1100', 7, '2-car garage 5-foot extension siding - 2CAR5XA/B/C'),
('62.40', '4 CAR GARAGE TANDEM SIDING', 0, 1, 0, '1100', 7, '4-car tandem garage siding - 4CARTA/B/C'),

-- 63 Series - Covered Patio Siding
('63.00', 'COVERED PATIO SIDING', 0, 1, 0, '1100', 7, 'Covered patio siding - COVP'),
('63.10', 'COVERED PATIO 1 SIDING', 0, 1, 0, '1100', 7, 'Covered patio 1 siding - COVP/COVD'),
('63.1p', 'OPT COVERED PATIO POST WRAP', 0, 1, 1, '1100', 7, 'Covered patio post wrap - COVP'),
('63.20', 'COVERED PATIO 2 SIDING', 0, 1, 0, '1100', 7, 'Covered patio 2 siding - COVP2'),
('63.2p', 'COVERED PATIO 2 POST WRAP', 0, 1, 1, '1100', 7, 'Covered patio 2 post wrap - COVD2/COVP2'),
('63.30', 'OPT COVERED PATIO 3 SIDING', 0, 1, 0, '1100', 7, 'Covered patio 3 siding - COVP3'),
('63.3p', 'COVERED PATIO 3 POST WRAP', 0, 1, 1, '1100', 7, 'Covered patio 3 post wrap - COVD3/COVP3'),
('63.61', 'COVERED PATIO SUNROOM SIDING', 0, 1, 0, '1100', 7, 'Sunroom covered patio siding - COVPSN1/COVP'),
('63.pw', 'COVERED PATIO POST WRAP', 0, 1, 1, '1100', 7, 'Covered patio post wrap - COVP'),
('63.sr', 'COVERED PATIO @ SUNROOM SIDING', 0, 1, 1, '1100', 7, 'Covered patio at sunroom siding - COVPSN1/COVD1SN'),
('63.xc', 'EXTENDED COVERED PATIO SIDING', 0, 1, 1, '1100', 7, 'Extended covered patio siding - COVPX'),
('63.xp', 'EXTENDED COVERED PATIO POST WRAP', 0, 1, 1, '1100', 7, 'Extended covered patio post wrap - COVPX'),

-- 65 Series - Covered Deck Siding
('65.10', 'OPT COVERED DECK SIDING', 0, 1, 0, '1100', 7, 'Covered deck siding - COVD'),
('65.1p', 'OPT COVERED DECK POST WRAP', 0, 1, 1, '1100', 7, 'Covered deck post wrap - COVD'),
('65.20', 'COVERED DECK 2 SIDING', 0, 1, 0, '1100', 7, 'Covered deck 2 siding - COVD2'),
('65.2p', 'COVERED DECK 2 POST WRAP', 0, 1, 1, '1100', 7, 'Covered deck 2 post wrap - COVD2'),
('65.30', 'OPT COVERED DECK 3 SIDING', 0, 1, 0, '1100', 7, 'Covered deck 3 siding - COVD3'),
('65.3p', 'OPT COVERED DECK 3 POST WRAP', 0, 1, 1, '1100', 7, 'Covered deck 3 post wrap - COVD3'),

-- 74 Series - Deck Surface & Rail
('74.10', 'DECK SURFACE & RAIL', 0, 1, 0, '1100', 8, 'Deck surface and railing - DECK'),
('74.20', 'DECK SURFACE & RAIL 2', 0, 1, 0, '1100', 8, 'Deck surface and railing 2 - DECK2'),
('74.30', 'DECK SURFACE & RAIL 3', 0, 1, 0, '1100', 8, 'Deck surface and railing 3 - DECK3'),
('74.60', 'DECK SURFACE & RAIL @ EXT GRT RM', 0, 1, 0, '1100', 8, 'Deck at extended great room - XGREAT/COVD2/WO2'),
('74.ed', 'EXT DECK SURFACE & RAIL', 0, 1, 1, '1100', 8, 'Extended deck surface and rail - COVD2/WO'),

-- 75 Series - Covered Deck Surface & Rail
('75.10', 'COVERED DECK SURFACE & RAIL', 0, 1, 0, '1100', 8, 'Covered deck surface and rail - COVD'),
('75.1s', 'STAIRS SURFACE & RAIL', 0, 1, 1, '1100', 8, 'Stairs surface and railing - COVD'),
('75.20', 'COVERED DECK 2 SURFACE & RAIL', 0, 1, 0, '1100', 8, 'Covered deck 2 surface and rail - COVD2'),
('75.2s', 'STAIRS 2 SURFACE & RAIL', 0, 1, 1, '1100', 8, 'Stairs 2 surface and railing - COVD2'),
('75.30', 'COVERED DECK 3 SURFACE & RAIL', 0, 1, 0, '1100', 8, 'Covered deck 3 surface and rail - COVD3'),
('75.tc', 'DECK SURFACE & RAIL TALLCRAWL', 0, 1, 1, '1100', 8, 'Deck surface and rail for tall crawl - TALLCRWL'),

-- 80 Series - Tall Crawl
('80.00', 'TALL CRAWL', 0, 1, 0, '1000', 1, 'Tall crawl space framing - TALLCRWL'),

-- 90 Series - Tall Crawl Siding
('90.00', 'TALL CRAWL SIDING', 0, 1, 0, '1100', 7, 'Tall crawl siding - TALLCRWL');

-- ============================================================================
-- Richmond Option Code Mappings
-- Defines Richmond builder's mnemonic codes and their relationships to phases
CREATE TABLE richmond_option_codes (
    option_id INTEGER PRIMARY KEY AUTOINCREMENT,
    option_code TEXT NOT NULL,
    option_description TEXT,
    phase_code TEXT,
    is_multi_phase BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phase_code) REFERENCES phase_option_definitions(phase_code)
);

-- Insert Richmond option codes from CSV analysis
INSERT INTO richmond_option_codes (option_code, option_description, phase_code, is_multi_phase) VALUES
-- Walk-out basement options
('WO', 'Walk-out Basement', '09.00', 0),
('WO2', 'Walk-out Basement Variant 2', '09.20', 0),
('SUNWO', 'Sunroom with Walk-out', '16.61', 0),

-- Foundation options
('FPSING', 'Fireplace Single', '11.01', 0),
('FPSING01', 'Fireplace Single Option 1', '10.01', 0),
('XGREAT', 'Extended Great Room', NULL, 1),
('SUN', 'Sunroom', NULL, 1),
('TALLCRWL', 'Tall Crawl Space', NULL, 1),
('LOFT', 'Loft', '32.lo', 0),
('LOFT2', 'Loft 2', NULL, 1),

-- Garage options
('3CARA', '3-Car Garage Option A', NULL, 1),
('3CARB', '3-Car Garage Option B', NULL, 1),
('3CARC', '3-Car Garage Option C', NULL, 1),
('3CARD', '3-Car Garage Option D', NULL, 1),
('4CARTA', '4-Car Tandem Garage Option A', NULL, 1),
('4CARTB', '4-Car Tandem Garage Option B', NULL, 1),
('4CARTC', '4-Car Tandem Garage Option C', NULL, 1),
('GAREXT2', '2-Car Garage 2-Foot Extension', NULL, 1),
('2CAR4XA', '2-Car Garage 4-Foot Extension Option A', NULL, 1),
('2CAR4XB', '2-Car Garage 4-Foot Extension Option B', NULL, 1),
('2CAR4XC', '2-Car Garage 4-Foot Extension Option C', NULL, 1),
('2CAR5XA', '2-Car Garage 5-Foot Extension Option A', NULL, 1),
('2CAR5XB', '2-Car Garage 5-Foot Extension Option B', NULL, 1),
('2CAR5XC', '2-Car Garage 5-Foot Extension Option C', NULL, 1),
('OPTI PLATE', 'Opti Plate Garage Extension', '22.2x', 0),

-- Patio and deck options
('COVP', 'Covered Patio', NULL, 1),
('COVP2', 'Covered Patio 2', NULL, 1),
('COVP3', 'Covered Patio 3', NULL, 1),
('COVPX', 'Extended Covered Patio', NULL, 1),
('COVPSN1', 'Covered Patio Sunroom 1', NULL, 1),
('DECK', 'Deck Option 1', NULL, 1),
('DECK2', 'Deck Option 2', NULL, 1),
('DECK3', 'Deck Option 3', NULL, 1),
('COVD', 'Covered Deck', NULL, 1),
('COVD2', 'Covered Deck 2', NULL, 1),
('COVD3', 'Covered Deck 3', NULL, 1),
('COVD1SN', 'Covered Deck 1 Sunroom', NULL, 1),

-- Window options
('WDWGREAT', 'Great Room Window', NULL, 1),
('WDWGRALT', 'Alternate Great Room Window with Fireplace', NULL, 1),
('WDWGRTX', 'Great Room Window at Extended Great Room', NULL, 1),
('WDWMBR', 'Master Bedroom Window', NULL, 1),
('WDWBR2', 'Bedroom 2 Window', NULL, 1),
('WDWBR3', 'Bedroom 3 Window', NULL, 1),
('WDWBR4', 'Bedroom 4 Window', NULL, 1),
('WDWBR5', 'Bedroom 5 Window', NULL, 1),
('WDWSTUDY', 'Study Window', NULL, 1),
('WDWBA2', 'Bathroom 2 Window', '34.16', 0),

-- Door options
('MSLIDE1', 'Center-Meet Sliding Door', NULL, 1),
('MSLIDE2', 'Multi-Slide Door', NULL, 1),
('SLIDE DOOR', 'Sliding Door', '20.13', 0),
('SLIDE DOOR @ LOFT', 'Sliding Door at Loft', '20.3l', 0),
('SLIDE DOOR SIDING', 'Sliding Door Siding', '60.13', 0),
('FRENCHDB', 'French Double Door', '20.33', 0),

-- Bathroom options
('DBA', 'Deluxe Bath Option A', NULL, 1),
('DBA2', 'Deluxe Bath Option 2', NULL, 1),
('DBA3', 'Deluxe Bath Option 3', '20.23', 0),
('ABAPWDR', 'Above Powder Room', '20.20', 0),

-- Bedroom options
('ABR4', 'Additional Bedroom 4', NULL, 1),
('ABR4BA', 'Additional Bedroom 4 with Bath', NULL, 1),
('ABR5', 'Additional Bedroom 5', '34.25', 0),
('ABR5BA', 'Additional Bedroom 5 with Bath', '20.25', 0),
('ABR5BA3', 'Additional Bedroom 5 with Bath Option 3', '34.25', 0),
('ABR5BA4', 'Additional Bedroom 5 with Bath Option 4', '34.25', 0),
('ABR6', 'Additional Bedroom 6', NULL, 1),

-- Other room options
('STUDY', 'Study', '20.27', 0),
('SITTING', 'Master Bedroom Sitting Area', NULL, 1),
('RETREAT', 'Clubhouse Retreat', '20.81', 0),
('BOOK1', 'Bookcase Option 1', '20.50', 0),

-- Ceiling options
('COFDIN', 'Coffered Dining Room Ceiling', '20.41', 0),
('COFMBR', 'Coffered Master Bedroom Ceiling', '20.42', 0),

-- Special options
('PORRAIL', 'Porch Rail', '60.pr', 0),
('TLLCRWL', 'Tall Crawl', NULL, 1),
('92L', '9-Foot 2nd Floor Ceiling', '34.9t', 0);

-- ============================================================================
-- Elevation Definitions
-- Defines standard elevation letters used across the system
CREATE TABLE elevations (
    elevation_code TEXT PRIMARY KEY,
    elevation_name TEXT NOT NULL,
    sort_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO elevations (elevation_code, elevation_name, sort_order) VALUES
('A', 'Elevation A', 1),
('B', 'Elevation B', 2),
('C', 'Elevation C', 3),
('D', 'Elevation D', 4);

-- ============================================================================
-- Plan Definitions
-- Defines plan numbers (placeholder - actual plan numbers from user's data)
CREATE TABLE plans (
    plan_id TEXT PRIMARY KEY,
    plan_name TEXT,
    plan_description TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Placeholder - user will populate with actual plan numbers
INSERT INTO plans (plan_id, plan_name, plan_description) VALUES
('XXXX', 'Template Plan', 'Placeholder for plan number - replace with actual 4-digit plan codes');

-- ============================================================================
-- LAYER 1: AGGREGATE CODES
-- High-level codes for estimating and quoting
-- Format: PLAN-PHASE/OPTION-MATERIALCLASS
CREATE TABLE layer1_codes (
    code_id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id TEXT NOT NULL,
    phase_option_code TEXT NOT NULL,
    material_class TEXT NOT NULL,
    full_code TEXT GENERATED ALWAYS AS (
        plan_id || '-' || phase_option_code || '-' || material_class
    ) STORED,
    description TEXT,
    estimated_price REAL,
    estimated_cost REAL,
    gp_percent REAL GENERATED ALWAYS AS (
        CASE
            WHEN estimated_price > 0 THEN
                ((estimated_price - estimated_cost) / estimated_price) * 100
            ELSE NULL
        END
    ) STORED,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id),
    FOREIGN KEY (phase_option_code) REFERENCES phase_option_definitions(phase_code),
    FOREIGN KEY (material_class) REFERENCES material_classes(class_code),
    UNIQUE(plan_id, phase_option_code, material_class)
);

-- Create index for full_code lookups
CREATE INDEX idx_layer1_full_code ON layer1_codes(full_code);
CREATE INDEX idx_layer1_plan ON layer1_codes(plan_id);
CREATE INDEX idx_layer1_phase ON layer1_codes(phase_option_code);

-- ============================================================================
-- Layer 1 Code Elevation Associations
-- Solves Richmond's triple-encoding problem: single source of truth for elevations
CREATE TABLE layer1_code_elevations (
    association_id INTEGER PRIMARY KEY AUTOINCREMENT,
    code_id INTEGER NOT NULL,
    elevation_code TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (code_id) REFERENCES layer1_codes(code_id) ON DELETE CASCADE,
    FOREIGN KEY (elevation_code) REFERENCES elevations(elevation_code),
    UNIQUE(code_id, elevation_code)
);

CREATE INDEX idx_layer1_elevations_code ON layer1_code_elevations(code_id);
CREATE INDEX idx_layer1_elevations_elev ON layer1_code_elevations(elevation_code);

-- ============================================================================
-- Layer 1 Code Richmond Option Associations
-- Links Richmond option codes to Layer 1 codes for cross-referencing
CREATE TABLE layer1_code_richmond_options (
    association_id INTEGER PRIMARY KEY AUTOINCREMENT,
    code_id INTEGER NOT NULL,
    option_code TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (code_id) REFERENCES layer1_codes(code_id) ON DELETE CASCADE,
    FOREIGN KEY (option_code) REFERENCES richmond_option_codes(option_code),
    UNIQUE(code_id, option_code)
);

CREATE INDEX idx_layer1_richmond_code ON layer1_code_richmond_options(code_id);
CREATE INDEX idx_layer1_richmond_option ON layer1_code_richmond_options(option_code);

-- ============================================================================
-- LAYER 2: DETAILED MATERIALS
-- SKU-level details for purchasing and inventory
CREATE TABLE layer2_materials (
    material_id INTEGER PRIMARY KEY AUTOINCREMENT,
    code_id INTEGER NOT NULL,
    item_code TEXT NOT NULL,
    item_description TEXT,
    quantity REAL NOT NULL DEFAULT 0,
    unit TEXT NOT NULL,
    unit_cost REAL,
    extended_cost REAL GENERATED ALWAYS AS (quantity * unit_cost) STORED,
    vendor_id TEXT,
    manufacturer_part_number TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (code_id) REFERENCES layer1_codes(code_id) ON DELETE CASCADE,
    UNIQUE(code_id, item_code)
);

CREATE INDEX idx_layer2_code ON layer2_materials(code_id);
CREATE INDEX idx_layer2_item ON layer2_materials(item_code);
CREATE INDEX idx_layer2_vendor ON layer2_materials(vendor_id);

-- ============================================================================
-- Vendors
-- Vendor/supplier information for Layer 2 materials
CREATE TABLE vendors (
    vendor_id TEXT PRIMARY KEY,
    vendor_name TEXT NOT NULL,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Subdivisions (from user's Power Query logic)
CREATE TABLE subdivisions (
    subdivision_id TEXT PRIMARY KEY,
    subdivision_name TEXT NOT NULL,
    subdivision_code TEXT,
    builder_id TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Builders
CREATE TABLE builders (
    builder_id TEXT PRIMARY KEY,
    builder_name TEXT NOT NULL,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default builders (Holt and Richmond)
INSERT INTO builders (builder_id, builder_name) VALUES
('HOLT', 'Holt Construction'),
('RICH', 'Richmond Construction');

-- ============================================================================
-- VIEWS FOR QUERYING
-- ============================================================================

-- View: Complete Layer 1 Codes with Descriptions
CREATE VIEW v_layer1_codes_complete AS
SELECT
    l1.code_id,
    l1.plan_id,
    p.plan_name,
    l1.phase_option_code,
    pod.phase_name,
    l1.material_class,
    mc.class_name AS material_class_name,
    l1.full_code,
    l1.description,
    pod.shipping_order,
    l1.estimated_price,
    l1.estimated_cost,
    l1.gp_percent,
    pod.is_base_phase,
    pod.is_option,
    pod.is_alpha_variant,
    l1.is_active
FROM layer1_codes l1
JOIN plans p ON l1.plan_id = p.plan_id
JOIN phase_option_definitions pod ON l1.phase_option_code = pod.phase_code
JOIN material_classes mc ON l1.material_class = mc.class_code;

-- View: Layer 1 Codes with Elevations
CREATE VIEW v_layer1_with_elevations AS
SELECT
    l1.code_id,
    l1.full_code,
    l1.plan_id,
    l1.phase_option_code,
    l1.material_class,
    l1.description,
    GROUP_CONCAT(l1e.elevation_code, ', ') AS elevations,
    l1.estimated_price,
    l1.estimated_cost,
    l1.gp_percent
FROM layer1_codes l1
LEFT JOIN layer1_code_elevations l1e ON l1.code_id = l1e.code_id
GROUP BY l1.code_id;

-- View: Layer 1 Codes with Richmond Options
CREATE VIEW v_layer1_with_richmond_options AS
SELECT
    l1.code_id,
    l1.full_code,
    l1.plan_id,
    l1.phase_option_code,
    l1.material_class,
    l1.description,
    GROUP_CONCAT(DISTINCT l1r.option_code, ', ') AS richmond_options,
    GROUP_CONCAT(DISTINCT ro.option_description, '; ') AS option_descriptions,
    l1.estimated_price,
    l1.estimated_cost
FROM layer1_codes l1
LEFT JOIN layer1_code_richmond_options l1r ON l1.code_id = l1r.code_id
LEFT JOIN richmond_option_codes ro ON l1r.option_code = ro.option_code
GROUP BY l1.code_id;

-- View: Complete Material Details (Layer 2 with Layer 1 context)
CREATE VIEW v_materials_complete AS
SELECT
    l2.material_id,
    l2.item_code,
    l2.item_description,
    l1.full_code AS layer1_code,
    l1.plan_id,
    l1.phase_option_code,
    pod.phase_name,
    l1.material_class,
    mc.class_name AS material_class_name,
    l2.quantity,
    l2.unit,
    l2.unit_cost,
    l2.extended_cost,
    l2.vendor_id,
    v.vendor_name,
    l2.manufacturer_part_number,
    l2.notes,
    l2.is_active
FROM layer2_materials l2
JOIN layer1_codes l1 ON l2.code_id = l1.code_id
JOIN phase_option_definitions pod ON l1.phase_option_code = pod.phase_code
JOIN material_classes mc ON l1.material_class = mc.class_code
LEFT JOIN vendors v ON l2.vendor_id = v.vendor_id;

-- View: Layer 1 Code Summary with Material Count and Total Cost
CREATE VIEW v_layer1_summary AS
SELECT
    l1.code_id,
    l1.full_code,
    l1.plan_id,
    l1.phase_option_code,
    pod.phase_name,
    l1.material_class,
    mc.class_name AS material_class_name,
    l1.description,
    pod.shipping_order,
    COUNT(DISTINCT l2.material_id) AS material_count,
    SUM(l2.extended_cost) AS total_material_cost,
    l1.estimated_cost,
    l1.estimated_price,
    l1.gp_percent,
    CASE
        WHEN l1.estimated_cost > 0 AND SUM(l2.extended_cost) > 0 THEN
            ((SUM(l2.extended_cost) - l1.estimated_cost) / l1.estimated_cost) * 100
        ELSE NULL
    END AS cost_variance_percent
FROM layer1_codes l1
JOIN phase_option_definitions pod ON l1.phase_option_code = pod.phase_code
JOIN material_classes mc ON l1.material_class = mc.class_code
LEFT JOIN layer2_materials l2 ON l1.code_id = l2.code_id
GROUP BY l1.code_id;

-- View: Richmond Option Code Cross-Reference
CREATE VIEW v_richmond_option_lookup AS
SELECT
    ro.option_code,
    ro.option_description,
    ro.phase_code,
    pod.phase_name,
    ro.is_multi_phase,
    COUNT(DISTINCT l1r.code_id) AS usage_count
FROM richmond_option_codes ro
LEFT JOIN phase_option_definitions pod ON ro.phase_code = pod.phase_code
LEFT JOIN layer1_code_richmond_options l1r ON ro.option_code = l1r.option_code
GROUP BY ro.option_code;

-- ============================================================================
-- SAMPLE DATA FROM CSV
-- ============================================================================

-- Sample Layer 1 codes based on CSV data (first 10 rows)
-- Note: Using plan_id 'XXXX' as placeholder per user's CSV

-- 09.00 WO BASEMENT WALLS - Framing
INSERT INTO layer1_codes (plan_id, phase_option_code, material_class, description)
VALUES ('XXXX', '09.00', '1000', 'WO BASEMENT WALLS');

-- Get the code_id for associating options
INSERT INTO layer1_code_richmond_options (code_id, option_code)
VALUES ((SELECT code_id FROM layer1_codes WHERE plan_id = 'XXXX' AND phase_option_code = '09.00' AND material_class = '1000'), 'WO');

-- 09.20 WO BASEMENT WALLS 2 - Framing
INSERT INTO layer1_codes (plan_id, phase_option_code, material_class, description)
VALUES ('XXXX', '09.20', '1000', 'WO BASEMENT WALLS 2');

INSERT INTO layer1_code_richmond_options (code_id, option_code)
VALUES ((SELECT code_id FROM layer1_codes WHERE plan_id = 'XXXX' AND phase_option_code = '09.20' AND material_class = '1000'), 'WO2');

-- 10.00 FOUNDATION - Framing (Base phase, no options, no elevations)
INSERT INTO layer1_codes (plan_id, phase_option_code, material_class, description)
VALUES ('XXXX', '10.00', '1000', 'FOUNDATION');

-- 10.01 OPT FOUNDATION - Framing
INSERT INTO layer1_codes (plan_id, phase_option_code, material_class, description)
VALUES ('XXXX', '10.01', '1000', 'OPT FOUNDATION');

INSERT INTO layer1_code_richmond_options (code_id, option_code)
VALUES ((SELECT code_id FROM layer1_codes WHERE plan_id = 'XXXX' AND phase_option_code = '10.01' AND material_class = '1000'), 'FPSING01');

-- 10.60 EXTENDED GREAT ROOM FOUNDATION - Framing
INSERT INTO layer1_codes (plan_id, phase_option_code, material_class, description)
VALUES ('XXXX', '10.60', '1000', 'EXTENDED GREAT ROOM FOUNDATION');

INSERT INTO layer1_code_richmond_options (code_id, option_code)
VALUES ((SELECT code_id FROM layer1_codes WHERE plan_id = 'XXXX' AND phase_option_code = '10.60' AND material_class = '1000'), 'XGREAT');

-- 10.61 SUNROOM FOUNDATION - Framing
INSERT INTO layer1_codes (plan_id, phase_option_code, material_class, description)
VALUES ('XXXX', '10.61', '1000', 'SUNROOM FOUNDATION');

INSERT INTO layer1_code_richmond_options (code_id, option_code)
VALUES ((SELECT code_id FROM layer1_codes WHERE plan_id = 'XXXX' AND phase_option_code = '10.61' AND material_class = '1000'), 'SUN');

-- 10.82 OPT DEN FOUNDATION - Framing (Row 8: no elevations)
INSERT INTO layer1_codes (plan_id, phase_option_code, material_class, description)
VALUES ('XXXX', '10.82', '1000', 'OPT DEN FOUNDATION');

-- 10.82 with elevations B, C, D (Row 9 from CSV)
-- Note: This demonstrates the elevation association pattern
DO $$
DECLARE
    v_code_id INTEGER;
BEGIN
    -- Get the code_id
    SELECT code_id INTO v_code_id
    FROM layer1_codes
    WHERE plan_id = 'XXXX' AND phase_option_code = '10.82' AND material_class = '1000';

    -- Associate elevations
    INSERT INTO layer1_code_elevations (code_id, elevation_code) VALUES
    (v_code_id, 'B'),
    (v_code_id, 'C'),
    (v_code_id, 'D');
END $$;

-- 10.83 OPT DEN W/FULL BATH FOUNDATION - Framing with elevations B, C, D
INSERT INTO layer1_codes (plan_id, phase_option_code, material_class, description)
VALUES ('XXXX', '10.83', '1000', 'OPT DEN W/FULL BATH FOUNDATION');

DO $$
DECLARE
    v_code_id INTEGER;
BEGIN
    SELECT code_id INTO v_code_id
    FROM layer1_codes
    WHERE plan_id = 'XXXX' AND phase_option_code = '10.83' AND material_class = '1000';

    INSERT INTO layer1_code_elevations (code_id, elevation_code) VALUES
    (v_code_id, 'B'),
    (v_code_id, 'C'),
    (v_code_id, 'D');
END $$;

-- 10.tc TALLCRAWL FRAMING - Framing
INSERT INTO layer1_codes (plan_id, phase_option_code, material_class, description)
VALUES ('XXXX', '10.tc', '1000', 'TALLCRAWL FRAMING');

INSERT INTO layer1_code_richmond_options (code_id, option_code)
VALUES ((SELECT code_id FROM layer1_codes WHERE plan_id = 'XXXX' AND phase_option_code = '10.tc' AND material_class = '1000'), 'TALLCRWL');

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to parse full code and return components
CREATE OR REPLACE FUNCTION parse_full_code(p_full_code TEXT)
RETURNS TABLE (
    plan_id TEXT,
    phase_option_code TEXT,
    material_class TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        SPLIT_PART(p_full_code, '-', 1)::TEXT AS plan_id,
        SPLIT_PART(p_full_code, '-', 2)::TEXT AS phase_option_code,
        SPLIT_PART(p_full_code, '-', 3)::TEXT AS material_class;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get all codes for a specific plan and elevation
CREATE OR REPLACE FUNCTION get_codes_for_plan_elevation(
    p_plan_id TEXT,
    p_elevation_code TEXT
)
RETURNS TABLE (
    full_code TEXT,
    phase_name TEXT,
    material_class_name TEXT,
    shipping_order INTEGER,
    richmond_options TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        l1.full_code,
        pod.phase_name,
        mc.class_name,
        pod.shipping_order,
        STRING_AGG(DISTINCT l1r.option_code, ', ') AS richmond_options
    FROM layer1_codes l1
    JOIN phase_option_definitions pod ON l1.phase_option_code = pod.phase_code
    JOIN material_classes mc ON l1.material_class = mc.class_code
    LEFT JOIN layer1_code_elevations l1e ON l1.code_id = l1e.code_id
    LEFT JOIN layer1_code_richmond_options l1r ON l1.code_id = l1r.code_id
    WHERE l1.plan_id = p_plan_id
        AND (l1e.elevation_code = p_elevation_code OR l1e.elevation_code IS NULL)
    GROUP BY l1.full_code, pod.phase_name, mc.class_name, pod.shipping_order
    ORDER BY pod.shipping_order, l1.full_code;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at timestamp on layer1_codes
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER layer1_codes_update_timestamp
BEFORE UPDATE ON layer1_codes
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER layer2_materials_update_timestamp
BEFORE UPDATE ON layer2_materials
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- NOTES AND USAGE EXAMPLES
-- ============================================================================

/*
USAGE EXAMPLES:

1. Get all codes for a plan and elevation:
   SELECT * FROM get_codes_for_plan_elevation('1234', 'B');

2. Find all materials for a specific Layer 1 code:
   SELECT * FROM v_materials_complete
   WHERE layer1_code = '1234-20.00-1000';

3. Get cost summary for a plan:
   SELECT
       plan_id,
       SUM(total_material_cost) AS total_cost,
       SUM(estimated_price) AS total_price,
       AVG(gp_percent) AS avg_gp_percent
   FROM v_layer1_summary
   WHERE plan_id = '1234'
   GROUP BY plan_id;

4. Look up Richmond option code:
   SELECT * FROM v_richmond_option_lookup
   WHERE option_code = 'XGREAT';

5. Get all codes with specific Richmond option:
   SELECT l1.full_code, ro.option_description
   FROM layer1_codes l1
   JOIN layer1_code_richmond_options l1r ON l1.code_id = l1r.code_id
   JOIN richmond_option_codes ro ON l1r.option_code = ro.option_code
   WHERE ro.option_code = 'DBA';

MIGRATION NOTES:

1. Holt Data Import:
   - Parse Holt's numeric hierarchical codes (167010200-4085)
   - Map to unified phase codes
   - Populate layer2_materials with SKU details
   - Link via layer1_code_id

2. Richmond Data Import:
   - Extract pack definitions from 3BAT
   - Parse pack names to extract phase, elevation, options
   - Use richmond_option_codes for translation
   - Populate layer1_code_elevations for elevation data
   - Populate layer1_code_richmond_options for option mapping

3. Elevation Handling:
   - Richmond: Parse "B, C, D" from CSV → insert 3 rows in layer1_code_elevations
   - Holt: Extract from template placeholders [Elevation]
   - Single source of truth eliminates triple-encoding problem

4. Code Format:
   - Layer 1: XXXX-XX.XX-XXXX (Plan-Phase-Class)
   - Full code generated via STORED computed column
   - Indexed for fast lookups

*/
