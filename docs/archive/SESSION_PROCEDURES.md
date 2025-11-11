# Session Procedures - Daily Workflow
**MindFlow Platform Development**

---

## 🌅 START OF SESSION (5 minutes)

### 1. Review Context (2 min)
```bash
# Check current branch and status
git status
git log --oneline -5

# Review yesterday's shutdown notes (if applicable)
# Location: Last session's commit message or PROGRESS.md
```

**Questions to answer**:
- What sprint/day am I on?
- What were yesterday's blockers?
- What's the primary goal today?

### 2. Check Documentation Status (2 min)
Review these files to understand current state:

```bash
# Quick doc check
cat docs/sprints/sprint-01/PROGRESS.md | tail -50
cat docs/time-tracking/2025-11-week*.md | tail -30
cat docs/technical-debt/REGISTER.md | grep "CRITICAL\|HIGH"
```

**Key files**:
- `docs/sprints/sprint-01/PROGRESS.md` - What's the current status?
- `docs/time-tracking/2025-11-week*.md` - Today's plan?
- `docs/technical-debt/REGISTER.md` - Any blockers?

### 3. Set Session Goals (1 min)
Write down 1-3 specific goals for this session:

**Example**:
```
Session: 2025-11-11 06:02 - Day 7
Goals:
1. Resolve TypeScript blocker from Day 6
2. Update documentation (CHANGELOG, REGISTER)
3. Commit and push progress
```

### 4. Start Time Tracking
Record session start time in `docs/time-tracking/2025-11-week*.md`

---

## 🔧 DURING SESSION

### Commit Frequently
- Commit after each meaningful unit of work (20-30 min)
- Use descriptive commit messages following template:

```bash
git commit -m "$(cat <<'EOF'
<type>: <short description>

## Context
<Why this change was needed>

## Changes Made
- <Change 1>
- <Change 2>

## Results/Impact
- <Impact 1>

## Documentation
- Updated: <file1>, <file2>
EOF
)"
```

**Commit Types**:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### Update Documentation As You Go
**Don't defer documentation!** Update these as you work:

1. **docs/sprints/sprint-01/PROGRESS.md** - Mark tasks complete
2. **docs/technical-debt/REGISTER.md** - Add/resolve debt immediately
3. Code comments - Explain complex logic

---

## 🌇 END OF SESSION (10-15 minutes)

**CRITICAL**: Never skip this! Future you will thank you.

### 1. Time Tracking (2 min)
Update `docs/time-tracking/2025-11-week*.md`:

```markdown
### Session N
- **Start**: HH:MM
- **End**: HH:MM
- **Duration**: X minutes (X.XX hours)
- **Activity**: <Brief description>
- **Category**: Planned Work | Debugging | Unplanned
- **Blockers**: <Any blockers encountered>
```

### 2. Update CHANGELOG.md (3 min)
If you completed a meaningful task, update `docs/CHANGELOG.md`:

```markdown
- [x] **Day N**: <Feature name> (<file path>)
  - Issue: <What problem was solved>
  - Impact: <What changed>
  - Breaking: <Any breaking changes>
  - Fix: <How it was fixed>
```

### 3. Update Technical Debt Register (2 min)
`docs/technical-debt/REGISTER.md`:

- **Added new tech debt?** → Create new TD-XXX entry
- **Resolved tech debt?** → Move to "Resolved" section
- **Discovered blockers?** → Add to register with CRITICAL priority

### 4. Update Sprint Progress (2 min)
`docs/sprints/sprint-01/PROGRESS.md`:

- Mark completed tasks
- Update "Work Completed" section
- Note any new blockers
- Update velocity tracking

### 5. Create Shutdown Notes (2 min)
Write brief notes for next session start:

**Template**:
```markdown
## Shutdown Notes - Day X

### ✅ Completed Today
- <Item 1>
- <Item 2>

### 🚧 In Progress
- <Item>: <Current state>

### ⚠️ Blockers
- <Blocker>: <Details>

### 📋 Next Session Priorities
1. <Priority 1>
2. <Priority 2>

**Total time**: <X hours X minutes>
```

Store in:
- Commit message, OR
- `docs/sprints/sprint-01/PROGRESS.md` Day N section

### 6. Commit & Push (2 min)
```bash
# Final commit of session
git add .
git commit -m "docs: End of Day X session - <summary>

<Shutdown notes from above>
"
git push -u origin <branch-name>
```

---

## 📋 WEEKLY PROCEDURES (Fridays)

### Weekly Review (30 min)
**When**: Every Friday end of day

1. **Review Technical Debt Register** (10 min)
   - Update priorities
   - Resolve any stale items
   - Recalculate metrics

2. **Update Sprint Retrospective** (10 min)
   - Add key learnings from the week
   - Note what went well
   - Note what needs improvement

3. **Time Tracking Analysis** (5 min)
   - Calculate weekly velocity
   - Identify time sinks
   - Adjust next week's estimates

4. **Documentation Audit** (5 min)
   - Check for stale docs
   - Archive old planning docs
   - Update README if structure changed

---

## 🚨 EMERGENCY PROCEDURES

### Session Interrupted
If session is interrupted unexpectedly:

```bash
# Quick save current state
git add .
git commit -m "WIP: Session interrupted - <what you were doing>"
git push

# Add note to PROGRESS.md
echo "⚠️ Session interrupted at $(date)" >> docs/sprints/sprint-01/PROGRESS.md
```

### Forgot to Track Time
Use git commit history to reconstruct:

```bash
# See all commits from today
git log --since="today" --oneline --author="your-name"

# See commit times
git log --since="today" --pretty=format:"%h %ad | %s" --date=format:'%H:%M'
```

### Lost Context
Recovery steps:

1. Check last commit message for shutdown notes
2. Read `docs/sprints/sprint-01/PROGRESS.md` Day N
3. Check `docs/time-tracking/2025-11-week*.md` last entry
4. Look at git diff of recent commits

---

## 📊 METRICS TO TRACK

### Daily
- [ ] Time spent (actual vs planned)
- [ ] Tasks completed
- [ ] Blockers encountered
- [ ] Tech debt created/resolved

### Weekly
- [ ] Total hours
- [ ] Velocity (planned vs actual)
- [ ] Tech debt trend
- [ ] Sprint progress %

### Sprint End
- [ ] Sprint goals achieved
- [ ] Key learnings documented
- [ ] Retrospective completed
- [ ] Phase review (if end of phase)

---

## ✅ SESSION CHECKLIST

### Start of Session
- [ ] Check git status and recent commits
- [ ] Review yesterday's shutdown notes
- [ ] Check technical debt register for blockers
- [ ] Set 1-3 specific session goals
- [ ] Record start time

### During Session
- [ ] Commit after each meaningful unit (20-30 min)
- [ ] Update documentation as you go
- [ ] Track blockers immediately

### End of Session
- [ ] Record session end time and duration
- [ ] Update CHANGELOG.md (if applicable)
- [ ] Update technical debt register
- [ ] Update sprint progress
- [ ] Write shutdown notes
- [ ] Commit and push all changes

### Friday (Weekly)
- [ ] Review and update technical debt register
- [ ] Update sprint retrospective
- [ ] Analyze time tracking
- [ ] Documentation audit

---

## 🎯 DOCUMENTATION PRIORITY

**Update these EVERY session** (5 min):
1. `docs/time-tracking/2025-11-week*.md` - Time log
2. `docs/sprints/sprint-01/PROGRESS.md` - Progress

**Update when relevant** (5 min):
3. `docs/CHANGELOG.md` - Completed features
4. `docs/technical-debt/REGISTER.md` - Debt items

**Update weekly** (30 min):
5. `docs/sprints/sprint-01/RETROSPECTIVE.md` - Learnings
6. Technical debt register review
7. Sprint progress velocity

**Don't update mid-sprint** (defer):
- Planning docs (SPRINT_PLAN.md, etc.)
- Setup guides (unless changed)
- Architecture docs (unless changed)

---

**Last Updated**: 2025-11-11
**Next Review**: End of Sprint 1 or when procedures need adjustment
