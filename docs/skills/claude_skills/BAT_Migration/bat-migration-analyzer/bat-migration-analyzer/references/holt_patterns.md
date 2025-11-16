# Holt Homes - System Patterns

## Overview
Holt's material management system uses a streamlined BAT structure with hierarchical numeric internal codes and single-encoding best practices.

## Item Coding Philosophy

### Core Approach
- **Philosophy**: Hierarchical Numeric Internal Codes
- **Code Structure**: Systematic numeric hierarchy (e.g., 10.20.30.040)
- **Organization**: Multi-level categorization through numbers

### Advantages
- Clear organizational hierarchy
- Easy to expand categories
- Programmatically enforceable

### Disadvantages
- Less human-readable than mnemonic codes
- Requires reference documentation
- Learning curve for new users

## Pack Structure
Holt uses identical format to Richmond: `|[Major].[Minor] PACK_NAME`

**Integration Advantage**: 100% compatible with Richmond format. No translation needed.

## Elevation Encoding

### Single-Encoding Best Practice
Holt uses **one location** for elevation data:
- Elevation stored in dedicated dimension/column
- NOT embedded in sheet names
- NOT embedded in item codes

### Advantages
- No synchronization risk
- Minimal maintenance
- Consistent data
- Clean architecture

## Migration Scope
- **Total Plans**: 50 documented plans
- **Total Line Items**: ~9,373 items
- **Percentage**: ~15% of total migration

## System Characteristics

### Strengths
1. Systematic organization with hierarchical codes
2. Clean architecture with single-encoding
3. Expandable structure
4. Programmatic validation enabled
5. Efficient (fewer items for similar plan count)

### Weaknesses
1. Readability requires documentation
2. Learning curve
3. Vendor mapping needed separately

## Integration Advantages
Holt's approach provides strong foundation for unified system:
- Already follows best practices
- Less technical debt
- Clean migration path
- Good model for unified design

## Comparison with Richmond

| Aspect | Richmond | Holt |
|--------|----------|------|
| Code Philosophy | Mnemonic prefixes | Hierarchical numeric |
| Prefix Count | 288 different types | Systematic levels |
| Elevation Storage | Triple-encoded | Single-encoded |
| Total Items | ~55,604 | ~9,373 |

## Unified System Recommendations
1. Adopt Holt's single-encoding for elevation
2. Consider hierarchical structure for item codes
3. Maintain pack format compatibility
4. Avoid inheriting Richmond's technical debt
