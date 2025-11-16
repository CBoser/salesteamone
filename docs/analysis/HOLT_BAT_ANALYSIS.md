# Holt BAT Analysis Report

**Date:** 2025-11-16
**Analyzed By:** Claude
**Purpose:** Review Holt BAT structure for automated import

---

## Executive Summary

✅ **Good News:** Holt data is **already coded** with the unified format!
✅ **Simpler Import:** No pack name parsing needed - codes are ready to use
✅ **Smaller Dataset:** 9,373 materials vs Richmond's 55,603
⚠️ **Different Structure:** One-to-many relationship (1 material → multiple codes)

---

## File Structure

### Primary Source: `indexMaterialListbyPlanHolt20251114.xlsx`

**Total Materials:** 9,373
**Sheet:** indexMaterialListsbyPlan

**Columns:**
1. `Option/Phase Number` - Comma-separated list of unified codes
2. `Pack ID / Elevation(s) / Pack-Option Name` - Pack identifier (e.g., "|10ABCD FOUNDATION")
3. `Description` - Material description (e.g., "sill plate", "bracing")
4. `Tally/ Notes` - Additional notes
5. `Format1` - Format code (e.g., "ST")
6. `Format2` - Secondary format
7. `Sku` - Material SKU (e.g., "24DF", "2616HF3TICAG")
8. `Qty` - Quantity
9. `UOM` - Unit of measure (e.g., "MBF")
10. `OnlineDescription` - Extended description

---

## Code Format Analysis

### Unified Code Format: `PPPP-PPP-EE - IIII`

**Example:** `167010100 - 4085`

| Component | Position | Example | Description |
|-----------|----------|---------|-------------|
| Plan | Digits 1-4 | `1670` | Plan number |
| Phase | Digits 5-7 | `101` | Phase code (3 digits) |
| Elevation | Digits 8-9 | `00` | Elevation code (2 digits) |
| Item Type | After ` - ` | `4085` | Item type code (4 digits) |

### Code Examples

```
167010100 - 4085  →  Plan: 1670, Phase: 101, Elev: 00, Item: 4085
167010200 - 4085  →  Plan: 1670, Phase: 102, Elev: 00, Item: 4085
189003004 - 4155  →  Plan: 1890, Phase: 030, Elev: 04, Item: 4155
```

---

## Dataset Statistics

### Unique Values

**Plans Found:** 16 unique plans
```
1649, 1670, 168i, 169e, 172e, 177i, 178e, 1890,
2184, 2299, 2336, 266B, 266i, 266j, 277e, 298e
```

**Phases Found:** 17 unique phase codes
```
010, 030, 040, 101, 102, 103, 104, 105, 106,
110, 111, 112, 195, 199, 200, 203, 204
```

**Elevations Found:** 31 unique elevation codes
```
00, 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, ...
```

**Item Types Found:** 12 unique item types
```
4085, 4155, 4156, 4157, 4158, 4159, 4160,
4161, 4162 (plus some whitespace variations)
```

**Total Unique Codes:** 521 plan-phase-elevation-item combinations

---

## Sample Data

### Row 1: Foundation Bracing
```
Option/Phase: 167010100 - 4085 , 167010200 - 4085 , 167010300 - 4085 , 167010400 - 4085
Pack ID:      |10ABCD FOUNDATION
Description:  bracing
Format1:      ST
SKU:          24DF
Qty:          60.0
UOM:          MBF
```

**Interpretation:**
This single material (bracing) applies to 4 different plan-phase combinations:
- Plan 1670, Phase 101, Elevation 00, Item Type 4085
- Plan 1670, Phase 102, Elevation 00, Item Type 4085
- Plan 1670, Phase 103, Elevation 00, Item Type 4085
- Plan 1670, Phase 104, Elevation 00, Item Type 4085

---

## Key Differences from Richmond

### Richmond Structure
- **Source:** RAH_MaterialDatabase.xlsx
- **Format:** One row per plan-material (55,603 rows)
- **Coding:** Pack names need parsing (`|10 FOUNDATION` → `010.000-**`)
- **Plan IDs:** G-series codes (G18L, G19E, etc.)
- **Complexity:** High - requires complex parser for 3 formats

### Holt Structure
- **Source:** indexMaterialListbyPlanHolt20251114.xlsx
- **Format:** One row per material with multiple codes (9,373 rows)
- **Coding:** Already in unified format (`167010100 - 4085`)
- **Plan IDs:** Numeric codes (1670, 1890, 2184, etc.)
- **Complexity:** Low - just split and parse existing codes

---

## Pack ID Format

Holt uses similar pack ID format to Richmond:

### Examples
```
|10ABCD FOUNDATION
|11ABCD MAIN JOIST SYSTEM
|12AB MAIN FLOOR SYSTEM
```

### Format Pattern: `|[Phase][Elevations] [Description]`

| Component | Example | Description |
|-----------|---------|-------------|
| Delimiter | `\|` | Pipe character |
| Phase | `10` | Phase number (2 digits) |
| Elevations | `ABCD` | Elevation letters |
| Description | `FOUNDATION` | Pack description |

**Note:** Pack IDs are **not used for code generation** in Holt import since codes are already provided in the `Option/Phase Number` column.

---

## Import Strategy

### Recommended Approach: **Direct Code Import**

Since Holt data already has unified codes, the import process is straightforward:

1. **Read** indexMaterialListbyPlanHolt20251114.xlsx
2. **For each row:**
   - Get the `Option/Phase Number` column value
   - Split by comma to get individual codes
   - **For each code:**
     - Parse into Plan-Phase-Elevation-ItemType
     - Create database entry with:
       - Full unified code
       - Description
       - SKU
       - Quantity
       - UOM
       - Pack ID (for reference)

### Example Expansion

**Input Row:**
```
Option/Phase: 167010100 - 4085 , 167010200 - 4085
Description:  sill plate
SKU:          2616HF3TICAG
Qty:          12.0
Pack ID:      |10ABCD FOUNDATION
```

**Output (2 database entries):**
```
Entry 1:
  Code: 1670-101.000-00-4085
  Description: sill plate
  SKU: 2616HF3TICAG
  Qty: 12.0
  Pack: |10ABCD FOUNDATION

Entry 2:
  Code: 1670-102.000-00-4085
  Description: sill plate
  SKU: 2616HF3TICAG
  Qty: 12.0
  Pack: |10ABCD FOUNDATION
```

---

## Import Script Requirements

### New Function Needed: `parse_holt_code()`

```python
def parse_holt_code(self, code_str: str) -> Dict:
    """Parse Holt unified code into components

    Args:
        code_str: Code like "167010100 - 4085"

    Returns:
        Dict with plan, phase, elevation, item_type

    Example:
        "167010100 - 4085" → {
            'plan': '1670',
            'phase': '101',
            'elevation': '00',
            'item_type': '4085',
            'full_code': '1670-101.000-00-4085'
        }
    """
    # Split on ' - ' to separate main code from item type
    parts = code_str.strip().split(' - ')
    if len(parts) != 2:
        return {'error': f"Invalid code format: {code_str}"}

    main_part = parts[0].strip()
    item_type = parts[1].strip()

    # Parse main part: PPPPPPPPEE (9 digits)
    # Plan: digits 0-3 (4 digits)
    # Phase: digits 4-6 (3 digits)
    # Elevation: digits 7-8 (2 digits)

    if len(main_part) != 9:
        return {'error': f"Main code should be 9 digits, got {len(main_part)}: {main_part}"}

    plan = main_part[0:4]
    phase = main_part[4:7]
    elevation = main_part[7:9]

    # Build unified code: PPPP-PPP.000-EE-IIII
    full_code = f"{plan}-{phase}.000-{elevation}-{item_type}"

    return {
        'plan': plan,
        'phase': phase,
        'elevation': elevation,
        'item_type': item_type,
        'full_code': full_code,
        'error': None
    }
```

### Import Process Modifications

**Current Script:** `tools/auto_import_bat.py`
**Mode:** Richmond-focused (parses pack names)

**Needed:** Add `--holt` mode that:
1. Reads indexMaterialListbyPlanHolt20251114.xlsx
2. Uses `parse_holt_code()` instead of `parse_richmond_pack_name()`
3. Handles one-to-many expansion (1 row → N database entries)
4. Validates code format before import

---

## Validation Checklist

Before running full Holt import, validate:

- [ ] Code parser handles all 521 unique codes
- [ ] One-to-many expansion works correctly
- [ ] Plan numbers are preserved (1670, 1890, etc.)
- [ ] Phase codes maintain 3-digit format (101, 102, 030)
- [ ] Elevation codes maintain 2-digit format (00, 01, 04)
- [ ] Item types are correctly extracted (4085, 4155, etc.)
- [ ] SKUs and quantities are preserved
- [ ] No duplicate entries created
- [ ] All 9,373 materials process successfully
- [ ] Database entries match expected count

---

## Expected Import Results

### Material Count Projection

**Input:** 9,373 material rows
**Output:** ~13,000-15,000 database entries (estimated)

**Reason:** Each material applies to ~1.4-1.6 plan-phase combinations on average

### Import Time Estimate

**Processing Speed:** ~1,000-2,000 rows/second
**Estimated Time:** 5-10 seconds for full import

---

## Data Quality Observations

### Strengths
✅ Codes already in unified format - no parsing errors
✅ Consistent code structure across all entries
✅ SKUs and quantities included
✅ Clear descriptions for most materials
✅ Pack IDs provided for reference

### Considerations
⚠️ Some plan codes use letters (168i, 169e, 172e) - may need special handling
⚠️ Item type codes have some whitespace variations
⚠️ Format1/Format2 columns need investigation
⚠️ Tally/Notes column mostly empty

---

## Next Steps

### 1. Update Import Script
- Add `--holt` mode to auto_import_bat.py
- Implement `parse_holt_code()` function
- Add one-to-many expansion logic
- Handle special plan codes (168i, 169e, etc.)

### 2. Test Import
- **Test Plan:** Plan 1670 (most common in dataset)
- **Dry Run:** Validate parsing on all 9,373 materials
- **Check:** Code format compliance, no errors

### 3. Full Import
- Import all Holt materials to database
- Generate validation report
- Verify database entries

---

## Comparison Summary

| Aspect | Richmond | Holt |
|--------|----------|------|
| **Materials** | 55,603 rows | 9,373 rows |
| **Plans** | 55 plans | 16 plans |
| **Coding** | Need parsing | Pre-coded ✅ |
| **Format** | G-series (G18L) | Numeric (1670) |
| **Complexity** | High (3 pack formats) | Low (direct import) |
| **Parser** | ✅ Complete | ⏳ Needed |
| **Status** | ✅ Tested (100% success) | ⏳ Not started |

---

## Recommendations

1. **Priority:** Low urgency - Holt import is simpler than Richmond
2. **Approach:** Add Holt mode to existing auto_import_bat.py script
3. **Testing:** Start with dry-run test on Plan 1670
4. **Timeline:** 30-45 minute implementation + testing
5. **Risk:** Low - data is clean and pre-structured

---

## Conclusion

The Holt BAT data is **well-structured and ready for import**. The presence of pre-coded unified format makes this significantly easier than Richmond import. The main task is implementing the code parser and one-to-many expansion logic.

**Estimated Effort:** 1 focused session (30-45 minutes)
**Success Probability:** Very High (data quality is excellent)
**Recommended:** Import Richmond first (already tested), then Holt

---

**Analysis Status:** ✅ Complete
**Ready for Implementation:** Yes
**Blocker Issues:** None
