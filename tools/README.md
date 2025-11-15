# Framework Tools

Python tools for the Corey Dev Framework - sustainable, high-quality development workflow.

## Tools

### Sprint Management

**create_sprint.py** - Create sprint directory structure
```bash
python tools/create_sprint.py <sprint_number>
python tools/create_sprint.py 8
python tools/create_sprint.py --help
```

Creates complete sprint documentation:
- PLAN.md - Sprint plan with Definition of Done
- PROGRESS.md - Daily progress tracking
- DECISIONS.md - Technical decisions log
- CHANGELOG.md - User-facing changes
- LEARNINGS.md - Lessons learned
- VALIDATION_CHECKLIST.md - Quality checklist

### Time Tracking

**log_time.py** - Track 30-minute development sessions
```bash
python tools/log_time.py start          # Start session
python tools/log_time.py end            # End session
python tools/log_time.py end "notes"    # End with notes
python tools/log_time.py summary        # Daily summary
python tools/log_time.py velocity       # Show metrics
```

Helps maintain sustainable pace with focused sessions.

### Validation

**run_validation.py** - Run 10-step validation process
```bash
python tools/run_validation.py quick    # Quick validation
python tools/run_validation.py full     # Full validation
python tools/run_validation.py step1    # Specific step
```

Automates quality checks:
- Type checking
- Build compilation
- Test execution
- Comprehensive reporting

### SQL Practice

**sql_practice.py** - Track SQL learning sessions
```bash
python tools/sql_practice.py start "topic"      # Start learning
python tools/sql_practice.py end "notes"        # End session
python tools/sql_practice.py progress           # View progress
python tools/sql_practice.py stats              # Statistics
python tools/sql_practice.py exercise <num>     # Mark complete
```

Tracks progress through 8-week SQL roadmap with 30-minute sessions.

## Version

All tools are at version **1.1.0**

Use `--version` flag on any tool to check version:
```bash
python tools/create_sprint.py --version
```

## Documentation

- **Framework Guide**: See [docs/framework/FRAMEWORK_TOOLS.md](../docs/framework/FRAMEWORK_TOOLS.md)
- **Improvements Log**: See [docs/framework/TOOLS_IMPROVEMENTS.md](../docs/framework/TOOLS_IMPROVEMENTS.md)
- **Learning Materials**: See [learning/](../learning/)

## Quick Start

1. **Create a sprint:**
   ```bash
   python tools/create_sprint.py 1
   ```

2. **Start working:**
   ```bash
   cd docs/sprints/sprint-01
   python ../../tools/log_time.py start
   ```

3. **Work for 30 minutes**, then:
   ```bash
   python ../../tools/log_time.py end "What you accomplished"
   ```

4. **Validate before finishing:**
   ```bash
   cd ../../../
   python tools/run_validation.py quick
   ```

## Requirements

- Python 3.7+
- No external dependencies (uses only standard library)

## Philosophy

These tools embody the Corey Dev Framework principles:
- **Sustainability**: 30-minute sessions, sustainable pace
- **Quality**: Automated validation, 70%+ test coverage
- **Documentation**: Comprehensive tracking and logging
- **Predictability**: Velocity tracking and metrics

---

**Maintained by:** Corey Dev Framework
**Version:** 1.1.0
**Status:** Production Ready ✅
