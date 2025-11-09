# Time Tracking Template

Use this template to track time for each work session.

---

## Daily Time Log Format

```markdown
## [Date] - Sprint [X] Day [Y]

**Planned Work**: [Brief description]
**Estimated Time**: [X hours]

### Session 1
- **Start**: [HH:MM AM/PM]
- **End**: [HH:MM AM/PM]
- **Duration**: [X.X hours]
- **Activity**: [What you worked on]
- **Category**: [Planned Work / Debugging / Documentation / Research / Unplanned]
- **Blockers**: [Any issues encountered]

### Session 2
- **Start**: [HH:MM AM/PM]
- **End**: [HH:MM AM/PM]
- **Duration**: [X.X hours]
- **Activity**: [What you worked on]
- **Category**: [Planned Work / Debugging / Documentation / Research / Unplanned]
- **Blockers**: [Any issues encountered]

---

**Total Time Today**: [X.X hours]
**Planned vs Actual**: [+/- X.X hours]
**Completed Tasks**:
- [x] Task 1
- [ ] Task 2 (partial)

**Tomorrow's Plan**:
- [ ] Continue Task 2
- [ ] Start Task 3
```

---

## Weekly Summary Format

```markdown
# Week of [Start Date] to [End Date]

| Day | Planned | Actual | Variance | Category Breakdown | Notes |
|-----|---------|--------|----------|-------------------|-------|
| Mon | 4h | 5.5h | +1.5h | Planned: 3h, Debug: 2.5h | Schema issues |
| Tue | 4h | 4h | 0h | Planned: 4h | On track |
| Wed | 4h | 6h | +2h | Planned: 2h, Debug: 3h, Docs: 1h | Major blockers |
| Thu | 4h | - | - | - | Not worked |
| Fri | 4h | - | - | - | Planned |
| **Total** | **20h** | **15.5h** | **+3.5h** | | |

**Blockers This Week**:
1. [Blocker description] - [X hours lost]
2. [Blocker description] - [X hours lost]

**Velocity**: [Actual / Planned = X.XX]

**Notes**:
- What went well
- What needs improvement
- Adjustments for next week
```

---

## Categories Explained

**Planned Work**: Working on scheduled sprint objectives
**Debugging**: Fixing bugs or resolving errors (unplanned)
**Documentation**: Writing docs, comments, retrospectives
**Research**: Learning new tech, reading docs, exploring codebase
**Unplanned**: Unexpected work (DevOps tools, environment setup, etc.)

---

## Tips for Accurate Tracking

1. **Start timer when you begin work** - Don't rely on memory
2. **Log blockers immediately** - Capture time lost to issues
3. **Be honest about breaks** - Don't count lunch/breaks as work time
4. **Round to nearest 0.25h** - 15-minute increments are fine
5. **Review weekly** - Look for patterns in time loss
6. **Adjust estimates** - Use actual data to improve future planning

---

## Example Entry

```markdown
## 2025-11-09 - Sprint 1 Day 3

**Planned Work**: Complete JWT testing and sprint documentation
**Estimated Time**: 4 hours

### Session 1
- **Start**: 9:00 AM
- **End**: 12:30 PM
- **Duration**: 3.5 hours
- **Activity**: Debugging TypeScript compilation errors in plan service
- **Category**: Debugging
- **Blockers**: Schema mismatch - plan service expects fields that don't exist

### Session 2
- **Start**: 2:00 PM
- **End**: 5:30 PM
- **Duration**: 3.5 hours
- **Activity**: Fixed material service errors, created type stubs, disabled routes
- **Category**: Debugging
- **Blockers**: Material service schema mismatch - 25+ errors

### Session 3
- **Start**: 7:00 PM
- **End**: 8:30 PM
- **Duration**: 1.5 hours
- **Activity**: End-to-end testing, verification, documentation
- **Category**: Planned Work
- **Blockers**: None

---

**Total Time Today**: 8.5 hours
**Planned vs Actual**: +4.5 hours (113% over estimate)
**Completed Tasks**:
- [x] Fixed TypeScript compilation errors (100+ → 12)
- [x] Created Prisma type stubs
- [x] Disabled plan/material routes
- [x] Verified all security features working
- [ ] JWT validation testing (deferred)
- [ ] Sprint documentation (deferred)

**Lessons Learned**:
- Environment differences masked schema issues
- Should validate schemas before implementing services
- Need buffer time for debugging

**Tomorrow's Plan**:
- [ ] Create time tracking system
- [ ] Run JWT validation tests
- [ ] Create sprint documentation structure
- [ ] Start Day 4: CORS Hardening
```
