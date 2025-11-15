#!/usr/bin/env python3
"""
Validation Runner - Runs the 10-step validation process from Corey Dev Framework
Automates validation checks and creates comprehensive report
"""

import sys
import subprocess
from pathlib import Path
from datetime import datetime

class ValidationRunner:
    """Run validation checks for a sprint"""

    def __init__(self, project_root: Path = None):
        self.project_root = project_root or Path.cwd()
        self.backend_dir = self.project_root / "backend"
        self.frontend_dir = self.project_root / "frontend"
        self.results = []

    def run_command(self, cmd: str, cwd: Path) -> tuple:
        """Run a shell command and capture output"""
        try:
            result = subprocess.run(
                cmd,
                shell=True,
                cwd=cwd,
                capture_output=True,
                text=True,
                timeout=300  # 5 minutes max
            )
            return result.returncode == 0, result.stdout, result.stderr
        except subprocess.TimeoutExpired:
            return False, "", "Command timed out"
        except Exception as e:
            return False, "", str(e)

    def step1_analyze_current_state(self):
        """Step 1: Analyze current state"""
        print("\n" + "="*70)
        print("STEP 1: Analyzing Current State")
        print("="*70)

        checks = []

        # Backend checks
        if self.backend_dir.exists():
            print("\n📦 Backend Analysis...")

            # Type check
            print("  - Running type-check...")
            success, stdout, stderr = self.run_command("npm run type-check", self.backend_dir)
            checks.append(("Backend Type Check", success, stderr))

            # Build
            print("  - Running build...")
            success, stdout, stderr = self.run_command("npm run build", self.backend_dir)
            checks.append(("Backend Build", success, stderr))

            # Tests
            print("  - Running tests...")
            success, stdout, stderr = self.run_command("npm run test", self.backend_dir)
            checks.append(("Backend Tests", success, stderr))

        # Frontend checks
        if self.frontend_dir.exists():
            print("\n🎨 Frontend Analysis...")

            # Type check
            print("  - Running type-check...")
            success, stdout, stderr = self.run_command("npm run type-check", self.frontend_dir)
            checks.append(("Frontend Type Check", success, stderr))

            # Build
            print("  - Running build...")
            success, stdout, stderr = self.run_command("npm run build", self.frontend_dir)
            checks.append(("Frontend Build", success, stderr))

            # Tests
            print("  - Running tests...")
            success, stdout, stderr = self.run_command("npm run test", self.frontend_dir)
            checks.append(("Frontend Tests", success, stderr))

        # Summarize
        print("\n📊 Analysis Summary:")
        for name, success, error in checks:
            status = "✅ PASS" if success else "❌ FAIL"
            print(f"  {status} - {name}")
            if not success and error:
                print(f"      Error: {error[:100]}...")

        self.results.append(("Step 1: Analyze Current State", checks))
        return all(success for _, success, _ in checks)

    def step5_test_compilation(self):
        """Step 5: Test compilation"""
        print("\n" + "="*70)
        print("STEP 5: Testing Compilation")
        print("="*70)

        all_pass = True

        # Backend compilation
        if self.backend_dir.exists():
            print("\n📦 Backend Compilation...")
            success, _, stderr = self.run_command("npm run build", self.backend_dir)
            status = "✅ PASS" if success else "❌ FAIL"
            print(f"  {status}")
            all_pass = all_pass and success

        # Frontend compilation
        if self.frontend_dir.exists():
            print("\n🎨 Frontend Compilation...")
            success, _, stderr = self.run_command("npm run build", self.frontend_dir)
            status = "✅ PASS" if success else "❌ FAIL"
            print(f"  {status}")
            all_pass = all_pass and success

        self.results.append(("Step 5: Test Compilation", all_pass))
        return all_pass

    def step9_run_tests(self):
        """Step 9: Run automated tests"""
        print("\n" + "="*70)
        print("STEP 9: Running Automated Tests")
        print("="*70)

        test_results = []

        # Backend tests
        if self.backend_dir.exists():
            print("\n📦 Backend Tests...")
            success, stdout, stderr = self.run_command("npm run test -- --coverage", self.backend_dir)
            test_results.append(("Backend Tests", success))

            # Parse coverage if available
            if "Coverage summary" in stdout:
                print("\n  Coverage Report:")
                for line in stdout.split('\n'):
                    if 'Statements' in line or 'Branches' in line or 'Functions' in line or 'Lines' in line:
                        print(f"    {line}")

        # Frontend tests
        if self.frontend_dir.exists():
            print("\n🎨 Frontend Tests...")
            success, stdout, stderr = self.run_command("npm run test -- --coverage", self.frontend_dir)
            test_results.append(("Frontend Tests", success))

        # Summary
        print("\n📊 Test Summary:")
        for name, success in test_results:
            status = "✅ PASS" if success else "❌ FAIL"
            print(f"  {status} - {name}")

        self.results.append(("Step 9: Run Automated Tests", test_results))
        return all(success for _, success in test_results)

    def generate_report(self, sprint_dir: Path = None):
        """Generate validation report"""
        print("\n" + "="*70)
        print("VALIDATION REPORT")
        print("="*70)

        report = f"""# Validation Report

**Date**: {datetime.now().strftime('%Y-%m-%d %H:%M')}
**Project**: {self.project_root.name}

## Results Summary

"""

        all_passed = True
        for step_name, step_results in self.results:
            if isinstance(step_results, bool):
                status = "✅ PASS" if step_results else "❌ FAIL"
                report += f"### {step_name}: {status}\n\n"
                all_passed = all_passed and step_results
            elif isinstance(step_results, list):
                report += f"### {step_name}\n\n"
                for item in step_results:
                    if len(item) == 2:
                        name, success = item
                        status = "✅ PASS" if success else "❌ FAIL"
                        report += f"- {status} {name}\n"
                        all_passed = all_passed and success
                    elif len(item) == 3:
                        name, success, error = item
                        status = "✅ PASS" if success else "❌ FAIL"
                        report += f"- {status} {name}\n"
                        if not success and error:
                            report += f"  ```\n  {error[:200]}\n  ```\n"
                        all_passed = all_passed and success
                report += "\n"

        report += f"\n## Overall Result: {'✅ PASS' if all_passed else '❌ FAIL'}\n"

        # Save report
        if sprint_dir:
            report_file = sprint_dir / f"validation_report_{datetime.now().strftime('%Y%m%d_%H%M')}.md"
            report_file.write_text(report)
            print(f"\n📝 Report saved to: {report_file}")
        else:
            report_file = self.project_root / "validation_report.md"
            report_file.write_text(report)
            print(f"\n📝 Report saved to: {report_file}")

        print(report)

        return all_passed

    def run_quick_validation(self):
        """Run quick validation (steps 1, 5, 9)"""
        print("\n🚀 Running Quick Validation")
        print("This runs the essential compilation and test checks\n")

        # Step 1
        step1_pass = self.step1_analyze_current_state()

        # Step 5
        step5_pass = self.step5_test_compilation()

        # Step 9
        step9_pass = self.step9_run_tests()

        # Generate report
        all_passed = self.generate_report()

        return all_passed

    def run_full_validation(self):
        """Run full 10-step validation"""
        print("\n🚀 Running Full Validation")
        print("This runs all 10 validation steps\n")

        print("Note: Steps 2-4, 6-8, and 10 require manual verification")
        print("Automated steps: 1, 5, 9\n")

        # Run automated steps
        step1_pass = self.step1_analyze_current_state()
        step5_pass = self.step5_test_compilation()
        step9_pass = self.step9_run_tests()

        # Remind about manual steps
        print("\n" + "="*70)
        print("MANUAL VALIDATION STEPS")
        print("="*70)

        print("""
Step 2: Review Sprint Objectives
  ⚠️  Manually review PLAN.md
  ⚠️  Verify Definition of Done
  ⚠️  Understand scope

Step 3-4: Fix Errors
  ⚠️  Prioritize fixes (imports → types → properties → logic)
  ⚠️  Fix one file at a time
  ⚠️  Commit after each file

Step 6: Test Application Startup
  ⚠️  Start backend: npm run dev
  ⚠️  Start frontend: npm start
  ⚠️  Check for console errors

Step 7: Test Sprint Features
  ⚠️  Manually test each acceptance criterion
  ⚠️  Create test data
  ⚠️  Run through user workflows

Step 8: Test Integration
  ⚠️  Test authentication
  ⚠️  Check previous sprint features
  ⚠️  Verify no regression

Step 10: Document Changes
  ⚠️  Update CHANGELOG.md
  ⚠️  Update PROGRESS.md
  ⚠️  Document known issues
        """)

        # Generate report
        all_passed = self.generate_report()

        return all_passed

def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print("Validation Runner - Corey Dev Framework")
        print("\nUsage:")
        print("  python run_validation.py quick      # Quick validation (compile + test)")
        print("  python run_validation.py full       # Full 10-step validation")
        print("  python run_validation.py step1      # Run specific step")
        print("\nExamples:")
        print("  python run_validation.py quick")
        print("  python run_validation.py full")
        sys.exit(1)

    command = sys.argv[1].lower()

    project_root = Path.cwd()
    runner = ValidationRunner(project_root)

    if command == 'quick':
        passed = runner.run_quick_validation()
        sys.exit(0 if passed else 1)

    elif command == 'full':
        passed = runner.run_full_validation()
        sys.exit(0 if passed else 1)

    elif command == 'step1':
        passed = runner.step1_analyze_current_state()
        sys.exit(0 if passed else 1)

    elif command == 'step5':
        passed = runner.step5_test_compilation()
        sys.exit(0 if passed else 1)

    elif command == 'step9':
        passed = runner.step9_run_tests()
        sys.exit(0 if passed else 1)

    else:
        print(f"Error: Unknown command '{command}'")
        print("Valid commands: quick, full, step1, step5, step9")
        sys.exit(1)

if __name__ == "__main__":
    main()
