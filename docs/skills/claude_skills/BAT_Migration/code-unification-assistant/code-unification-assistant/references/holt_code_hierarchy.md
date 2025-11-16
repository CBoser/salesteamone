# Holt Code Hierarchy

## Overview
Holt uses a systematic hierarchical numeric code structure with clear parent-child relationships.

## Hierarchy Levels

### Level 1: Division (XX.00.00.000)
Top-level material divisions

**Structure**: Two-digit number
**Increment**: By 10
**Range**: 10-99

**Example Divisions**:
- **10** - Concrete & Foundations
- **20** - Framing & Structure
- **30** - Electrical
- **40** - Plumbing
- **50** - HVAC
- **60** - Finishes
- **70** - Fixtures
- **80** - Openings (Doors/Windows)
- **90** - Roofing & Exterior

### Level 2: Category (10.XX.00.000)
Material categories within divisions

**Structure**: Two-digit number
**Increment**: By 10 or smaller
**Range**: 10-99

**Example** (Division 10 - Concrete):
- **10.10** - Ready-mix concrete
- **10.20** - Concrete accessories
- **10.30** - Formwork
- **10.40** - Reinforcing

### Level 3: Subcategory (10.20.XX.000)
Specific material types

**Structure**: Two-digit number
**Increment**: By 10 or smaller
**Range**: 10-99

**Example** (Category 10.20 - Accessories):
- **10.20.10** - Anchor bolts
- **10.20.20** - Expansion joints
- **10.20.30** - Sealants
- **10.20.40** - Coatings

### Level 4: Item (10.20.30.XXX)
Individual materials

**Structure**: Three-digit number
**Increment**: Sequential
**Range**: 001-999

**Example** (Subcategory 10.20.30 - Sealants):
- **10.20.30.001** - Silicone sealant 10oz
- **10.20.30.002** - Polyurethane sealant
- **10.20.30.003** - Acrylic sealant

## Complete Hierarchy Example

```
10 - Concrete & Foundations (Division)
├── 10.10 - Ready-mix Concrete (Category)
│   ├── 10.10.10 - Standard Mix (Subcategory)
│   │   ├── 10.10.10.001 - 3000 PSI Mix
│   │   ├── 10.10.10.002 - 4000 PSI Mix
│   │   └── 10.10.10.003 - 5000 PSI Mix
│   └── 10.10.20 - Specialty Mix
│       ├── 10.10.20.001 - Fiber-reinforced
│       └── 10.10.20.002 - Self-leveling
├── 10.20 - Concrete Accessories
│   ├── 10.20.10 - Anchor Bolts
│   └── 10.20.20 - Expansion Joints
└── 10.30 - Formwork
    ├── 10.30.10 - Forms
    └── 10.30.20 - Form Accessories
```

## Systematic Benefits

### Expandability
Easy to add new items without restructuring:
- New item in existing subcategory: 10.20.30.004
- New subcategory: 10.20.50
- New category: 10.50
- New division: 100 (if needed)

### Querying
Hierarchical queries simple:
```sql
-- All concrete items
SELECT * FROM materials WHERE item_code LIKE '10.%'

-- All concrete accessories
SELECT * FROM materials WHERE item_code LIKE '10.20.%'

-- All anchor bolts
SELECT * FROM materials WHERE item_code LIKE '10.20.10.%'
```

### Organization
Clear parent-child relationships:
- Items roll up to subcategories
- Subcategories roll up to categories
- Categories roll up to divisions

## Division Details

### 10 - Concrete & Foundations
**Item Count**: ~1,100
**Categories**: Ready-mix, accessories, formwork, reinforcing

### 20 - Framing & Structure
**Item Count**: ~1,800
**Categories**: Lumber, engineered wood, metal framing, fasteners

### 30 - Electrical
**Item Count**: ~1,300
**Categories**: Wire/cable, panels, devices, fixtures

### 40 - Plumbing
**Item Count**: ~1,200
**Categories**: Pipe, fittings, fixtures, valves

### 50 - HVAC
**Item Count**: ~800
**Categories**: Equipment, ductwork, vents, controls

### 60 - Finishes
**Item Count**: ~2,400
**Categories**: Drywall, paint, flooring, tile, trim

### 70 - Fixtures & Appliances
**Item Count**: ~900
**Categories**: Cabinets, appliances, countertops

### 80 - Openings
**Item Count**: ~1,200
**Categories**: Doors, windows, hardware

### 90 - Roofing & Exterior
**Item Count**: ~600
**Categories**: Roofing, siding, gutters

## Naming Convention

**Division Names**: Broad material groups
**Category Names**: Specific material types
**Subcategory Names**: Detailed classifications
**Item Names**: Individual products with specs

## Code Assignment Rules

### New Item Assignment
1. Identify appropriate division
2. Select relevant category
3. Choose subcategory
4. Assign next available item number

### Reserved Ranges
- x9.xx.xx - Reserved for future expansion
- xx.99.xx - Special items
- xx.xx.99.xxx - Miscellaneous

## Comparison to Richmond

| Aspect | Holt | Richmond |
|--------|------|----------|
| Structure | Hierarchical (4 levels) | Flat (prefix only) |
| Expandability | Easy (add numbers) | Hard (new prefixes) |
| Readability | Requires reference | Intuitive prefixes |
| Organization | Systematic | Ad-hoc |
| Validation | Programmatic | Manual |
| Total Items | ~9,373 | ~55,604 |

## Migration to Unified

### Holt → Hybrid Mapping
Holt codes can map cleanly to hybrid system:

**Holt**: 10.20.30.001
**Hybrid**: 10.CONC.030.001

Strategy:
- Keep division number (10)
- Add mnemonic hint (CONC)
- Keep rest of hierarchy

### Benefits
- Preserves Holt structure
- Adds Richmond readability
- No data loss
- Smooth transition

## Efficiency Analysis

**Why Holt Has Fewer Items** (9,373 vs Richmond's 55,604):

1. **Better Standardization**: Fewer duplicate materials
2. **Consolidation**: Grouped similar items
3. **Smaller Operation**: Fewer plans/communities
4. **Efficient Management**: Less material proliferation

**Lesson**: Systematic codes promote efficiency

## Best Practices Demonstrated

✅ Clear hierarchy
✅ Logical groupings
✅ Easy expansion
✅ Programmatic validation
✅ Minimal duplication
✅ Efficient organization

## Adoption for Unified System

**Recommendations**:
1. Use Holt's division structure (10, 20, 30...)
2. Keep hierarchical levels
3. Add mnemonic hints for readability
4. Maintain systematic expansion
5. Adopt validation rules
