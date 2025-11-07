#!/usr/bin/env python3
"""
MindFlow Platform - Project Manager Script
Handles diagnostics, auto-fixes, database management, and project organization

This script provides a comprehensive suite of utilities for:
- System diagnostics and issue detection
- Automatic fixing of common problems
- Database management (reset, migrate, seed)
- Dependency cleanup and installation
- Project file organization and review
- Environment setup and validation

Quick Start:
  python project_manager.py --diagnose    # Check for issues
  python project_manager.py --fix         # Auto-fix issues
  python project_manager.py --install     # Install dependencies
  python project_manager.py --reset-db    # Setup database
"""

import os
import sys
import subprocess
import shutil
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional
import argparse


class Colors:
    """ANSI color codes for terminal output"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


class ProjectManager:
    """Main project management class"""

    def __init__(self, project_root: Optional[Path] = None):
        self.project_root = project_root or Path(__file__).parent.absolute()
        self.backend_dir = self.project_root / "backend"
        self.frontend_dir = self.project_root / "frontend"
        self.shared_dir = self.project_root / "shared"

    def print_header(self, text: str):
        """Print formatted header"""
        print(f"\n{Colors.HEADER}{'=' * 60}{Colors.ENDC}")
        print(f"{Colors.HEADER}{text.center(60)}{Colors.ENDC}")
        print(f"{Colors.HEADER}{'=' * 60}{Colors.ENDC}\n")

    def print_success(self, text: str):
        """Print success message"""
        print(f"{Colors.OKGREEN}✓ {text}{Colors.ENDC}")

    def print_warning(self, text: str):
        """Print warning message"""
        print(f"{Colors.WARNING}⚠ {text}{Colors.ENDC}")

    def print_error(self, text: str):
        """Print error message"""
        print(f"{Colors.FAIL}✗ {text}{Colors.ENDC}")

    def print_info(self, text: str):
        """Print info message"""
        print(f"{Colors.OKBLUE}ℹ {text}{Colors.ENDC}")

    def confirm_action(self, message: str, default: bool = False) -> bool:
        """Ask user for confirmation"""
        default_text = "Y/n" if default else "y/N"
        response = input(f"{Colors.WARNING}{message} ({default_text}): {Colors.ENDC}").strip().lower()

        if not response:
            return default

        return response in ['y', 'yes']

    def run_command(self, command: List[str], cwd: Optional[Path] = None,
                    shell: bool = False, check: bool = True) -> subprocess.CompletedProcess:
        """Run a shell command and return the result"""
        try:
            if shell:
                command = ' '.join(command)

            result = subprocess.run(
                command,
                cwd=cwd or self.project_root,
                shell=shell,
                capture_output=True,
                text=True,
                check=check
            )
            return result
        except subprocess.CalledProcessError as e:
            self.print_error(f"Command failed: {' '.join(command) if isinstance(command, list) else command}")
            self.print_error(f"Error: {e.stderr}")
            if check:
                raise
            return e

    # =========================================================================
    # DIAGNOSTICS AND AUTO-FIX
    # =========================================================================

    def diagnose(self) -> Dict:
        """Run comprehensive diagnostics and identify issues"""
        self.print_header("System Diagnostics")

        print(f"{Colors.OKBLUE}Running comprehensive health check...{Colors.ENDC}")
        print(f"{Colors.OKBLUE}This will check:{Colors.ENDC}")
        print(f"  • Node.js and npm installation")
        print(f"  • Docker installation and status")
        print(f"  • Environment files (.env)")
        print(f"  • Database configuration")
        print(f"  • Installed dependencies")
        print(f"  • Port availability")
        print()

        issues = []
        warnings = []
        info = []

        # Check Node.js and npm
        self.print_info("Checking Node.js installation...")
        try:
            # Use shell=True on Windows to find executables in PATH
            use_shell = sys.platform == 'win32'
            node_result = self.run_command(['node', '--version'], check=False, shell=use_shell)
            npm_result = self.run_command(['npm', '--version'], check=False, shell=use_shell)

            if node_result.returncode == 0:
                node_version = node_result.stdout.strip()
                self.print_success(f"Node.js: {node_version}")
                info.append(f"Node.js {node_version} installed")
            else:
                self.print_error("Node.js not found")
                issues.append({
                    'type': 'critical',
                    'category': 'prerequisites',
                    'message': 'Node.js is not installed',
                    'fix': 'Install Node.js 20+ from https://nodejs.org'
                })

            if npm_result.returncode == 0:
                npm_version = npm_result.stdout.strip()
                self.print_success(f"npm: {npm_version}")
            else:
                self.print_error("npm not found")
                issues.append({
                    'type': 'critical',
                    'category': 'prerequisites',
                    'message': 'npm is not installed',
                    'fix': 'npm should come with Node.js installation'
                })
        except Exception as e:
            self.print_error(f"Failed to check Node.js: {e}")
            issues.append({
                'type': 'critical',
                'category': 'prerequisites',
                'message': 'Failed to check Node.js installation',
                'fix': 'Install Node.js 20+ from https://nodejs.org'
            })

        # Check Docker
        self.print_info("\nChecking Docker installation...")
        try:
            use_shell = sys.platform == 'win32'
            docker_result = self.run_command(['docker', '--version'], check=False, shell=use_shell)
            if docker_result.returncode == 0:
                docker_version = docker_result.stdout.strip()
                self.print_success(f"Docker: {docker_version}")

                # Check if Docker is running
                ps_result = self.run_command(['docker', 'ps'], check=False, shell=use_shell)
                if ps_result.returncode == 0:
                    self.print_success("Docker is running")
                else:
                    self.print_warning("Docker is installed but not running")
                    issues.append({
                        'type': 'error',
                        'category': 'docker',
                        'message': 'Docker is not running',
                        'fix': 'Start Docker Desktop'
                    })
            else:
                self.print_error("Docker not found")
                issues.append({
                    'type': 'critical',
                    'category': 'prerequisites',
                    'message': 'Docker is not installed',
                    'fix': 'Install Docker Desktop from https://www.docker.com/products/docker-desktop'
                })
        except Exception as e:
            self.print_error(f"Docker not found or not running: {e}")
            issues.append({
                'type': 'critical',
                'category': 'docker',
                'message': 'Docker is not available',
                'fix': 'Install and start Docker Desktop'
            })

        # Check .env files
        self.print_info("\nChecking environment files...")
        env_files = [
            (self.backend_dir / '.env', 'backend/.env', 'backend/.env.example'),
            (self.frontend_dir / '.env', 'frontend/.env', 'frontend/.env.example'),
        ]

        for env_file, display_name, example_file in env_files:
            example_path = self.project_root / example_file
            if env_file.exists():
                self.print_success(f"{display_name} exists")
            else:
                if example_path.exists():
                    self.print_warning(f"{display_name} missing (but .env.example exists)")
                    issues.append({
                        'type': 'warning',
                        'category': 'environment',
                        'message': f'{display_name} file is missing',
                        'fix': 'auto',
                        'action': lambda: shutil.copy(example_path, env_file)
                    })
                else:
                    self.print_error(f"{display_name} and {example_file} both missing")
                    issues.append({
                        'type': 'error',
                        'category': 'environment',
                        'message': f'{display_name} and example file both missing',
                        'fix': 'Create .env.example file first'
                    })

        # Check DATABASE_URL in backend .env
        backend_env = self.backend_dir / '.env'
        if backend_env.exists():
            with open(backend_env, 'r') as f:
                env_content = f.read()
                if 'DATABASE_URL=' in env_content and 'DATABASE_URL=""' not in env_content:
                    self.print_success("DATABASE_URL is configured")
                else:
                    self.print_error("DATABASE_URL is missing or empty")
                    issues.append({
                        'type': 'error',
                        'category': 'environment',
                        'message': 'DATABASE_URL is not properly configured',
                        'fix': 'Set DATABASE_URL in backend/.env file'
                    })

        # Check node_modules
        self.print_info("\nChecking dependencies...")
        node_modules_dirs = [
            (self.project_root / "node_modules", "root node_modules"),
            (self.frontend_dir / "node_modules", "frontend node_modules"),
            (self.backend_dir / "node_modules", "backend node_modules"),
        ]

        missing_deps = []
        for nm_dir, display_name in node_modules_dirs:
            if nm_dir.exists():
                self.print_success(f"{display_name} exists")
            else:
                self.print_warning(f"{display_name} not found")
                missing_deps.append(display_name)

        if missing_deps:
            issues.append({
                'type': 'warning',
                'category': 'dependencies',
                'message': f"Missing dependencies: {', '.join(missing_deps)}",
                'fix': 'auto',
                'action': 'install_dependencies'
            })

        # Check for patch-package in frontend
        frontend_pkg_json = self.frontend_dir / 'package.json'
        if frontend_pkg_json.exists():
            with open(frontend_pkg_json, 'r') as f:
                pkg_data = json.load(f)
                if 'patch-package' in pkg_data.get('devDependencies', {}):
                    self.print_success("patch-package is installed (Windows fix)")
                else:
                    self.print_warning("patch-package not in devDependencies")
                    warnings.append("Consider adding patch-package for Windows compatibility")

        # Check for database volume conflicts
        self.print_info("\nChecking database status...")
        try:
            use_shell = sys.platform == 'win32'
            volume_result = self.run_command(['docker', 'volume', 'ls'], check=False, shell=use_shell)
            if volume_result.returncode == 0:
                if 'constructionplatform_postgres_data' in volume_result.stdout:
                    self.print_info("Database volume exists")

                    # Check if containers are running
                    ps_result = self.run_command(['docker', 'ps', '-a'], check=False, shell=use_shell)
                    if 'mindflow-postgres' in ps_result.stdout:
                        if 'Up' in ps_result.stdout:
                            self.print_success("PostgreSQL container is running")
                        else:
                            self.print_warning("PostgreSQL container exists but is not running")
                            issues.append({
                                'type': 'warning',
                                'category': 'database',
                                'message': 'PostgreSQL container is stopped',
                                'fix': 'Run: docker compose up -d'
                            })
                else:
                    self.print_info("No database volume found (clean slate)")
        except Exception as e:
            self.print_warning(f"Could not check database status: {e}")

        # Check for port conflicts
        self.print_info("\nChecking port availability...")
        ports_to_check = [
            (3001, 'Backend API'),
            (5173, 'Frontend Dev Server'),
            (5433, 'PostgreSQL (Docker)'),
        ]

        for port, service in ports_to_check:
            if sys.platform == 'win32':
                # Windows: use netstat
                result = self.run_command(['netstat', '-ano'], check=False)
                if f':{port}' in result.stdout:
                    self.print_warning(f"Port {port} ({service}) may be in use")
                    warnings.append(f"Port {port} appears to be in use by another process")
                else:
                    self.print_success(f"Port {port} ({service}) is available")
            else:
                # Linux/Mac: use lsof
                result = self.run_command(['lsof', '-i', f':{port}'], check=False)
                if result.stdout.strip():
                    self.print_warning(f"Port {port} ({service}) is in use")
                    warnings.append(f"Port {port} is in use")
                else:
                    self.print_success(f"Port {port} ({service}) is available")

        # Summarize results
        print(f"\n{Colors.BOLD}{'=' * 60}{Colors.ENDC}")
        print(f"{Colors.BOLD}📊 Diagnostic Summary{Colors.ENDC}")
        print(f"{Colors.BOLD}{'=' * 60}{Colors.ENDC}\n")

        critical_issues = [i for i in issues if i['type'] == 'critical']
        errors = [i for i in issues if i['type'] == 'error']
        warning_issues = [i for i in issues if i['type'] == 'warning']

        if critical_issues:
            print(f"{Colors.FAIL}Critical Issues ({len(critical_issues)}):{Colors.ENDC}")
            for issue in critical_issues:
                print(f"  ✗ {issue['message']}")
                print(f"    Fix: {issue['fix']}")
            print()

        if errors:
            print(f"{Colors.FAIL}Errors ({len(errors)}):{Colors.ENDC}")
            for issue in errors:
                print(f"  ✗ {issue['message']}")
                print(f"    Fix: {issue['fix']}")
            print()

        if warning_issues:
            print(f"{Colors.WARNING}Warnings ({len(warning_issues)}):{Colors.ENDC}")
            for issue in warning_issues:
                print(f"  ⚠ {issue['message']}")
                if 'fix' in issue:
                    if issue['fix'] == 'auto':
                        print(f"    Fix: Can be auto-fixed")
                    else:
                        print(f"    Fix: {issue['fix']}")
            print()

        if not critical_issues and not errors and not warning_issues:
            print(f"{Colors.OKGREEN}{'=' * 60}{Colors.ENDC}")
            print(f"{Colors.OKGREEN}✓ No issues found! System is ready.{Colors.ENDC}")
            print(f"{Colors.OKGREEN}{'=' * 60}{Colors.ENDC}\n")
            print(f"{Colors.BOLD}Next steps:{Colors.ENDC}")
            print(f"  • Run: {Colors.OKCYAN}python project_manager.py --install{Colors.ENDC} (if dependencies needed)")
            print(f"  • Run: {Colors.OKCYAN}python project_manager.py --reset-db{Colors.ENDC} (to setup database)")
            print(f"  • Run: {Colors.OKCYAN}launch.bat{Colors.ENDC} or {Colors.OKCYAN}npm run dev{Colors.ENDC} (to start servers)")
            print()

        if warnings:
            print(f"{Colors.WARNING}Additional Warnings:{Colors.ENDC}")
            for warning in warnings:
                print(f"  ⚠ {warning}")
            print()

        # Show recommended next steps if issues found
        if critical_issues or errors or warning_issues:
            print(f"{Colors.BOLD}Recommended Actions:{Colors.ENDC}")
            if critical_issues:
                print(f"  {Colors.FAIL}1. Fix critical issues above (install Node.js/Docker){Colors.ENDC}")
            if fixable_issues := [i for i in issues if i.get('fix') == 'auto']:
                print(f"  {Colors.OKGREEN}2. Run: python project_manager.py --fix{Colors.ENDC}")
                print(f"     This will automatically fix {len(fixable_issues)} issue(s)")
            if errors and not critical_issues:
                print(f"  {Colors.WARNING}3. Review errors above and follow suggested fixes{Colors.ENDC}")
            print()

        return {
            'issues': issues,
            'warnings': warnings,
            'critical_count': len(critical_issues),
            'error_count': len(errors),
            'warning_count': len(warning_issues)
        }

    def auto_fix(self):
        """Automatically fix common issues"""
        self.print_header("Auto-Fix Issues")

        # Run diagnostics first
        diagnostic_results = self.diagnose()

        fixable_issues = [i for i in diagnostic_results['issues']
                         if i.get('fix') == 'auto']

        if not fixable_issues:
            self.print_info("No auto-fixable issues found!")
            return

        print(f"\n{Colors.OKBLUE}Found {len(fixable_issues)} auto-fixable issues{Colors.ENDC}\n")

        for issue in fixable_issues:
            self.print_info(f"Fixing: {issue['message']}")

            try:
                if 'action' in issue:
                    if callable(issue['action']):
                        issue['action']()
                        self.print_success("Fixed!")
                    elif issue['action'] == 'install_dependencies':
                        self.install_dependencies()
                        self.print_success("Dependencies installed!")
            except Exception as e:
                self.print_error(f"Failed to fix: {e}")

        self.print_success("\n✨ Auto-fix complete!")
        self.print_info("\nRun 'python project_manager.py --diagnose' to verify")

    # =========================================================================
    # DATABASE OPERATIONS
    # =========================================================================

    def reset_database(self, skip_seed: bool = False):
        """Reset the database: drop, migrate, and seed"""
        self.print_header("Database Reset")

        if not self.confirm_action("⚠️  This will DELETE ALL DATA! Continue?", default=False):
            self.print_info("Database reset cancelled")
            return

        try:
            # Setup environment files first
            self.setup_env_files()

            # Stop database and remove volumes atomically
            self.print_info("[1/5] Stopping database and removing volumes...")
            use_shell = sys.platform == 'win32'
            # Use -v flag to remove volumes along with containers
            self.run_command(['docker', 'compose', 'down', '-v'], shell=use_shell)
            self.print_success("Database and volumes removed")

            # Give Docker time to fully clean up
            self.print_info("Waiting for Docker to fully clean up (5 seconds)...")
            import time
            time.sleep(5)

            # Verify volume is gone
            self.print_info("[2/5] Verifying cleanup...")
            volume_check = self.run_command(['docker', 'volume', 'ls'], check=False, shell=use_shell)
            if 'constructionplatform_postgres_data' in volume_check.stdout:
                self.print_warning("Old volume still exists, force removing...")
                self.run_command(['docker', 'volume', 'rm', 'constructionplatform_postgres_data'],
                               check=False, shell=use_shell)
                time.sleep(2)
            self.print_success("Cleanup verified")

            # Start database
            self.print_info("[3/5] Starting fresh PostgreSQL instance...")
            self.run_command(['docker', 'compose', 'up', '-d'], shell=use_shell)
            self.print_info("Waiting for database to initialize (20 seconds)...")
            time.sleep(20)

            # Verify database is actually ready
            self.print_info("Checking database health...")
            health_check = self.run_command(['docker', 'ps'], check=False, shell=use_shell)
            if 'mindflow-postgres' not in health_check.stdout or 'Up' not in health_check.stdout:
                raise Exception("Database container failed to start properly")
            self.print_success("Database started with fresh credentials")

            # Run migrations
            self.print_info("[4/5] Running migrations...")
            env = os.environ.copy()
            env['PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING'] = '1'

            # Generate Prisma client
            self.print_info("Generating Prisma client...")
            self.run_command(['npm', 'run', 'prisma:generate'],
                           cwd=self.backend_dir, shell=use_shell)

            # Run migration
            self.print_info("Running database migrations...")
            self.run_command(['npm', 'run', 'prisma:migrate'],
                           cwd=self.backend_dir, shell=use_shell)
            self.print_success("Migrations completed")

            # Seed database
            if not skip_seed:
                self.print_info("[5/5] Seeding database...")
                self.run_command(['npm', 'run', 'prisma:seed'],
                               cwd=self.backend_dir, shell=use_shell)
                self.print_success("Database seeded")
            else:
                self.print_info("[5/5] Skipping seed (as requested)")

            self.print_success("\n✨ Database reset complete!")

        except Exception as e:
            self.print_error(f"Database reset failed: {str(e)}")
            self.print_info("\nTroubleshooting:")
            self.print_info("1. Make sure Docker Desktop is running")
            self.print_info("2. Run manually: docker compose down -v")
            self.print_info("3. Run manually: docker system prune --volumes")
            self.print_info("4. Then try this reset command again")
            self.print_info("5. If still failing, check docker-compose.yml credentials match .env")
            raise

    def seed_database(self):
        """Seed the database with sample data"""
        self.print_header("Seed Database")

        try:
            self.print_info("Seeding database with sample data...")
            self.run_command(['npm', 'run', 'prisma:seed'],
                           cwd=self.backend_dir, shell=True)
            self.print_success("Database seeded successfully")
        except Exception as e:
            self.print_error(f"Database seed failed: {str(e)}")
            raise

    def open_db_studio(self):
        """Open Prisma Studio to view database"""
        self.print_header("Prisma Studio")

        try:
            self.print_info("Opening Prisma Studio...")
            self.print_info("Press Ctrl+C to stop Prisma Studio")
            self.run_command(['npx', 'prisma', 'studio'],
                           cwd=self.backend_dir, shell=True)
        except KeyboardInterrupt:
            self.print_info("\nPrisma Studio closed")

    # =========================================================================
    # DEPENDENCY CLEANUP
    # =========================================================================

    def clean_dependencies(self, full_clean: bool = False):
        """Clean node_modules and package-lock files"""
        self.print_header("Clean Dependencies")

        if not self.confirm_action("This will remove all node_modules folders. Continue?",
                                   default=False):
            self.print_info("Cleanup cancelled")
            return

        # Stop any running Node processes
        self.print_info("Stopping Node processes...")
        try:
            if sys.platform == 'win32':
                subprocess.run(['taskkill', '/F', '/IM', 'node.exe'],
                             capture_output=True, check=False)
            else:
                subprocess.run(['pkill', '-9', 'node'],
                             capture_output=True, check=False)
        except Exception:
            pass

        # Directories to clean
        node_modules_dirs = [
            self.project_root / "node_modules",
            self.frontend_dir / "node_modules",
            self.backend_dir / "node_modules",
        ]

        # Clean node_modules
        for dir_path in node_modules_dirs:
            if dir_path.exists():
                self.print_info(f"Removing {dir_path.relative_to(self.project_root)}...")
                try:
                    shutil.rmtree(dir_path)
                    self.print_success(f"✓ {dir_path.relative_to(self.project_root)} removed")
                except Exception as e:
                    self.print_warning(f"Could not remove {dir_path}: {e}")
            else:
                self.print_info(f"✓ {dir_path.relative_to(self.project_root)} not found (already clean)")

        # Clean package-lock files if full clean
        if full_clean:
            self.print_info("\nRemoving package-lock.json files...")
            lock_files = [
                self.project_root / "package-lock.json",
                self.frontend_dir / "package-lock.json",
                self.backend_dir / "package-lock.json",
            ]

            for lock_file in lock_files:
                if lock_file.exists():
                    lock_file.unlink()
                    self.print_success(f"✓ {lock_file.relative_to(self.project_root)} removed")

        self.print_success("\n✨ Cleanup complete!")
        self.print_info("\nNext steps:")
        self.print_info("  1. Run 'python project_manager.py --install' to reinstall dependencies")
        self.print_info("  2. Or run 'setup.bat' on Windows")

    def setup_env_files(self):
        """Create .env files from .env.example if they don't exist"""
        self.print_info("Checking environment files...")

        env_configs = [
            (self.backend_dir / '.env.example', self.backend_dir / '.env', 'backend'),
            (self.frontend_dir / '.env.example', self.frontend_dir / '.env', 'frontend'),
        ]

        created_any = False
        for example_file, env_file, location in env_configs:
            if example_file.exists():
                if not env_file.exists():
                    shutil.copy(example_file, env_file)
                    self.print_success(f"Created {location}/.env from .env.example")
                    created_any = True
                else:
                    self.print_info(f"{location}/.env already exists")
            else:
                self.print_warning(f"{location}/.env.example not found")

        if not created_any:
            self.print_info("All .env files already exist")

    def install_dependencies(self):
        """Install all project dependencies"""
        self.print_header("Install Dependencies")

        try:
            # Setup environment files first
            self.setup_env_files()

            # Root dependencies
            self.print_info("[1/3] Installing root dependencies...")
            self.run_command(['npm', 'install'], shell=True)
            self.print_success("Root dependencies installed")

            # Backend dependencies
            self.print_info("[2/3] Installing backend dependencies...")
            self.run_command(['npm', 'install'], cwd=self.backend_dir, shell=True)
            self.print_success("Backend dependencies installed")

            # Frontend dependencies
            self.print_info("[3/3] Installing frontend dependencies...")
            self.run_command(['npm', 'install'], cwd=self.frontend_dir, shell=True)
            self.print_success("Frontend dependencies installed")

            self.print_success("\n✨ All dependencies installed!")

        except Exception as e:
            self.print_error(f"Dependency installation failed: {str(e)}")
            raise

    # =========================================================================
    # PROJECT ORGANIZATION
    # =========================================================================

    def analyze_project_structure(self) -> Dict:
        """Analyze current project structure and return stats"""
        self.print_header("Project Structure Analysis")

        stats = {
            'total_files': 0,
            'total_dirs': 0,
            'code_files': {},
            'doc_files': [],
            'config_files': [],
            'large_files': [],
            'outdated_docs': [],
        }

        # File extensions to track
        code_extensions = {
            '.ts': 'TypeScript',
            '.tsx': 'TypeScript React',
            '.js': 'JavaScript',
            '.jsx': 'JavaScript React',
            '.py': 'Python',
            '.sql': 'SQL',
            '.prisma': 'Prisma Schema',
        }

        # Walk through project
        for root, dirs, files in os.walk(self.project_root):
            # Skip node_modules, .git, and other common directories
            dirs[:] = [d for d in dirs if d not in
                      ['node_modules', '.git', 'dist', 'build', '__pycache__']]

            stats['total_dirs'] += len(dirs)

            for file in files:
                file_path = Path(root) / file
                stats['total_files'] += 1

                # Track code files
                ext = file_path.suffix.lower()
                if ext in code_extensions:
                    lang = code_extensions[ext]
                    stats['code_files'][lang] = stats['code_files'].get(lang, 0) + 1

                # Track documentation
                if ext == '.md':
                    stats['doc_files'].append(file_path.relative_to(self.project_root))

                # Track config files
                if file in ['package.json', 'tsconfig.json', '.env', '.env.example',
                           'docker-compose.yml', 'vite.config.ts', 'tailwind.config.js']:
                    stats['config_files'].append(file_path.relative_to(self.project_root))

                # Track large files (> 1MB)
                try:
                    if file_path.stat().st_size > 1_000_000:
                        size_mb = file_path.stat().st_size / 1_000_000
                        stats['large_files'].append({
                            'path': file_path.relative_to(self.project_root),
                            'size_mb': round(size_mb, 2)
                        })
                except Exception:
                    pass

        # Print analysis
        print(f"\n{Colors.BOLD}📊 Project Statistics:{Colors.ENDC}")
        print(f"   Total Files: {stats['total_files']}")
        print(f"   Total Directories: {stats['total_dirs']}")

        print(f"\n{Colors.BOLD}💻 Code Files by Language:{Colors.ENDC}")
        for lang, count in sorted(stats['code_files'].items(),
                                 key=lambda x: x[1], reverse=True):
            print(f"   {lang}: {count} files")

        print(f"\n{Colors.BOLD}📚 Documentation Files ({len(stats['doc_files'])}):{Colors.ENDC}")
        for doc in stats['doc_files']:
            print(f"   {doc}")

        print(f"\n{Colors.BOLD}⚙️  Configuration Files ({len(stats['config_files'])}):{Colors.ENDC}")
        for config in stats['config_files']:
            print(f"   {config}")

        if stats['large_files']:
            print(f"\n{Colors.BOLD}📦 Large Files (> 1MB):{Colors.ENDC}")
            for file_info in stats['large_files']:
                print(f"   {file_info['path']} ({file_info['size_mb']} MB)")

        return stats

    def organize_documentation(self):
        """Organize documentation files into docs folder"""
        self.print_header("Organize Documentation")

        docs_dir = self.project_root / "docs"

        # Create docs directory if it doesn't exist
        if not docs_dir.exists():
            docs_dir.mkdir()
            self.print_success(f"Created {docs_dir.relative_to(self.project_root)} directory")

        # Documentation files to organize
        doc_patterns = [
            '*_GUIDE.md',
            '*_DOCUMENTATION.md',
            '*_README.md',
            '*_INSTRUCTIONS.md',
            'SETUP.md',
            'WINDOWS_SETUP.md',
        ]

        moved_files = []
        for pattern in doc_patterns:
            for doc_file in self.project_root.glob(pattern):
                if doc_file.name == 'README.md':  # Keep main README in root
                    continue

                target = docs_dir / doc_file.name
                if not target.exists():
                    shutil.copy2(doc_file, target)
                    moved_files.append(doc_file.name)
                    self.print_success(f"Copied {doc_file.name} to docs/")

        # Also organize backend docs
        backend_docs = [
            'CUSTOMER_MIGRATION_INSTRUCTIONS.md',
            'CUSTOMER_API_DOCUMENTATION.md',
            'SERVICE_LAYER_README.md',
        ]

        backend_docs_dir = docs_dir / "backend"
        if not backend_docs_dir.exists():
            backend_docs_dir.mkdir()

        for doc_name in backend_docs:
            doc_file = self.backend_dir / doc_name
            if doc_file.exists():
                target = backend_docs_dir / doc_name
                if not target.exists():
                    shutil.copy2(doc_file, target)
                    moved_files.append(f"backend/{doc_name}")
                    self.print_success(f"Copied backend/{doc_name} to docs/backend/")

        if moved_files:
            self.print_success(f"\n✨ Organized {len(moved_files)} documentation files")
        else:
            self.print_info("No documentation files to organize")

    def create_project_report(self):
        """Create a comprehensive project status report"""
        self.print_header("Generate Project Report")

        report_file = self.project_root / f"PROJECT_REPORT_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"

        with open(report_file, 'w', encoding='utf-8') as f:
            f.write("# MindFlow Platform - Project Report\n\n")
            f.write(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")

            # Project structure
            f.write("## Project Structure\n\n")
            f.write("```\n")
            f.write("salesteamone/\n")
            f.write("├── backend/          # Express + Prisma API\n")
            f.write("├── frontend/         # React + Vite UI\n")
            f.write("├── shared/           # Shared TypeScript types\n")
            f.write("├── docs/             # Documentation\n")
            f.write("└── scripts/          # Utility scripts\n")
            f.write("```\n\n")

            # Get stats
            stats = {}
            try:
                # Count TypeScript files
                ts_files = list(self.backend_dir.rglob("*.ts"))
                tsx_files = list(self.frontend_dir.rglob("*.tsx"))
                stats['backend_ts'] = len([f for f in ts_files if 'node_modules' not in str(f)])
                stats['frontend_tsx'] = len([f for f in tsx_files if 'node_modules' not in str(f)])

                # Count components
                components = list(self.frontend_dir.rglob("components/**/*.tsx"))
                stats['components'] = len([f for f in components if 'node_modules' not in str(f)])
            except Exception:
                pass

            # Technology stack
            f.write("## Technology Stack\n\n")
            f.write("### Backend\n")
            f.write("- **Runtime:** Node.js + TypeScript\n")
            f.write("- **Framework:** Express.js\n")
            f.write("- **Database:** PostgreSQL + Prisma ORM\n")
            f.write("- **Authentication:** JWT + Bcrypt\n")
            f.write("- **Validation:** Zod\n\n")

            f.write("### Frontend\n")
            f.write("- **Framework:** React 19 + TypeScript\n")
            f.write("- **Build Tool:** Vite\n")
            f.write("- **Styling:** Tailwind CSS v4\n")
            f.write("- **State Management:** React Query (TanStack)\n")
            f.write("- **Routing:** React Router v7\n\n")

            # Features implemented
            f.write("## Features Implemented\n\n")
            f.write("### Customer Management\n")
            f.write("- ✅ Customer CRUD operations\n")
            f.write("- ✅ Contact management\n")
            f.write("- ✅ Pricing tier configuration\n")
            f.write("- ✅ External system ID mapping\n")
            f.write("- ✅ Search, filter, and pagination\n\n")

            f.write("### Authentication\n")
            f.write("- ✅ User registration and login\n")
            f.write("- ✅ JWT token-based authentication\n")
            f.write("- ✅ Role-based access control (RBAC)\n")
            f.write("- ✅ Development mode (authentication disabled)\n\n")

            # Database schema
            f.write("## Database Schema\n\n")
            f.write("### Tables\n")
            f.write("- `users` - User accounts and authentication\n")
            f.write("- `customers` - Customer records\n")
            f.write("- `customer_contacts` - Customer contact information\n")
            f.write("- `customer_pricing_tiers` - Pricing tier history\n")
            f.write("- `customer_external_ids` - External system mappings\n")
            f.write("- `jobs` - Future: Job records\n")
            f.write("- `plans` - Future: Plan records\n")
            f.write("- `materials` - Future: Material catalog\n\n")

            # API endpoints
            f.write("## API Endpoints\n\n")
            f.write("### Authentication (`/api/auth`)\n")
            f.write("- `POST /register` - Register new user\n")
            f.write("- `POST /login` - User login\n")
            f.write("- `GET /me` - Get current user\n\n")

            f.write("### Customers (`/api/customers`)\n")
            f.write("- `GET /` - List customers (with filters)\n")
            f.write("- `GET /:id` - Get customer by ID\n")
            f.write("- `POST /` - Create customer\n")
            f.write("- `PUT /:id` - Update customer\n")
            f.write("- `DELETE /:id` - Delete customer\n")
            f.write("- `GET /:id/contacts` - Get customer contacts\n")
            f.write("- `POST /:id/contacts` - Add contact\n")
            f.write("- `GET /:id/pricing-tiers` - Get pricing tiers\n")
            f.write("- `GET /:id/external-ids` - Get external IDs\n\n")

            # Next steps
            f.write("## Next Steps\n\n")
            f.write("1. **Plans Module** - Implement plan CRUD operations\n")
            f.write("2. **Materials Module** - Build material catalog\n")
            f.write("3. **Jobs Module** - Create job management system\n")
            f.write("4. **Takeoffs Module** - Implement material takeoff features\n")
            f.write("5. **Variance Tracking** - Build variance detection system\n\n")

            # Maintenance notes
            f.write("## Maintenance Notes\n\n")
            f.write("### Database Reset\n")
            f.write("```bash\n")
            f.write("python project_manager.py --reset-db\n")
            f.write("```\n\n")

            f.write("### Clean Dependencies\n")
            f.write("```bash\n")
            f.write("python project_manager.py --clean\n")
            f.write("```\n\n")

            f.write("### Development Mode\n")
            f.write("```bash\n")
            f.write("# Start backend (http://localhost:3001)\n")
            f.write("cd backend && npm run dev\n\n")
            f.write("# Start frontend (http://localhost:5173)\n")
            f.write("cd frontend && npm run dev\n")
            f.write("```\n")

        self.print_success(f"Report generated: {report_file.name}")
        return report_file


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description='MindFlow Platform - Project Management Tool',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  %(prog)s --diagnose              # Run system diagnostics
  %(prog)s --fix                   # Auto-fix detected issues
  %(prog)s --reset-db              # Reset database (drop, migrate, seed)
  %(prog)s --reset-db --no-seed    # Reset database without seeding
  %(prog)s --seed                  # Seed database only
  %(prog)s --clean                 # Clean node_modules
  %(prog)s --clean --full          # Clean node_modules and package-lock
  %(prog)s --install               # Install all dependencies
  %(prog)s --analyze               # Analyze project structure
  %(prog)s --organize-docs         # Organize documentation files
  %(prog)s --report                # Generate project report
  %(prog)s --studio                # Open Prisma Studio
  %(prog)s --all                   # Full reset: clean + install + reset-db

Common Workflows:
  # First time setup or troubleshooting:
  %(prog)s --diagnose              # See what's wrong
  %(prog)s --fix                   # Fix what can be auto-fixed
  %(prog)s --install               # Install dependencies
  %(prog)s --reset-db              # Setup database

  # Clean slate reset:
  %(prog)s --all                   # Clean everything and start fresh
        '''
    )

    # Diagnostic operations
    parser.add_argument('--diagnose', action='store_true',
                       help='Run comprehensive system diagnostics')
    parser.add_argument('--fix', action='store_true',
                       help='Automatically fix detected issues')

    # Database operations
    parser.add_argument('--reset-db', action='store_true',
                       help='Reset database (drop, migrate, seed)')
    parser.add_argument('--no-seed', action='store_true',
                       help='Skip seeding when resetting database')
    parser.add_argument('--seed', action='store_true',
                       help='Seed database only')

    # Dependency operations
    parser.add_argument('--clean', action='store_true',
                       help='Clean node_modules folders')
    parser.add_argument('--full', action='store_true',
                       help='Full clean (includes package-lock files)')
    parser.add_argument('--install', action='store_true',
                       help='Install all dependencies')

    # Project management
    parser.add_argument('--analyze', action='store_true',
                       help='Analyze project structure')
    parser.add_argument('--organize-docs', action='store_true',
                       help='Organize documentation files')
    parser.add_argument('--report', action='store_true',
                       help='Generate project status report')
    parser.add_argument('--studio', action='store_true',
                       help='Open Prisma Studio')

    # Bulk operations
    parser.add_argument('--all', action='store_true',
                       help='Full reset: clean + install + reset-db')

    args = parser.parse_args()

    # Create manager instance
    manager = ProjectManager()

    try:
        # Handle --all flag
        if args.all:
            manager.clean_dependencies(full_clean=True)
            manager.install_dependencies()
            manager.reset_database(skip_seed=False)
            return

        # Individual operations
        if args.diagnose:
            results = manager.diagnose()
            # Exit with error code if critical issues found
            if results['critical_count'] > 0:
                sys.exit(1)

        if args.fix:
            manager.auto_fix()

        if args.clean:
            manager.clean_dependencies(full_clean=args.full)

        if args.install:
            manager.install_dependencies()

        if args.reset_db:
            manager.reset_database(skip_seed=args.no_seed)

        if args.seed:
            manager.seed_database()

        if args.analyze:
            manager.analyze_project_structure()

        if args.organize_docs:
            manager.organize_documentation()

        if args.report:
            manager.create_project_report()

        if args.studio:
            manager.open_db_studio()

        # If no arguments, show help with diagnostic emphasis
        if not any(vars(args).values()):
            print(f"\n{Colors.HEADER}{'=' * 60}{Colors.ENDC}")
            print(f"{Colors.HEADER}MindFlow Platform - Project Management Tool{Colors.ENDC}")
            print(f"{Colors.HEADER}{'=' * 60}{Colors.ENDC}\n")

            print(f"{Colors.BOLD}🔍 Quick Start - Diagnostic & Setup:{Colors.ENDC}")
            print(f"  {Colors.OKCYAN}python project_manager.py --diagnose{Colors.ENDC}")
            print(f"     └─ Run comprehensive system diagnostics")
            print(f"  {Colors.OKCYAN}python project_manager.py --fix{Colors.ENDC}")
            print(f"     └─ Auto-fix detected issues")
            print(f"  {Colors.OKCYAN}python project_manager.py --install{Colors.ENDC}")
            print(f"     └─ Install all dependencies")
            print(f"  {Colors.OKCYAN}python project_manager.py --reset-db{Colors.ENDC}")
            print(f"     └─ Setup database (drop, migrate, seed)")
            print()

            print(f"{Colors.BOLD}📦 Maintenance Commands:{Colors.ENDC}")
            print(f"  {Colors.OKBLUE}--clean{Colors.ENDC}          Clean node_modules")
            print(f"  {Colors.OKBLUE}--analyze{Colors.ENDC}        Analyze project structure")
            print(f"  {Colors.OKBLUE}--studio{Colors.ENDC}         Open Prisma Studio")
            print(f"  {Colors.OKBLUE}--all{Colors.ENDC}            Full reset (clean + install + reset-db)")
            print()

            print(f"{Colors.BOLD}💡 Common Workflows:{Colors.ENDC}")
            print(f"  {Colors.WARNING}First time setup or troubleshooting:{Colors.ENDC}")
            print(f"    1. python project_manager.py --diagnose")
            print(f"    2. python project_manager.py --fix")
            print(f"    3. python project_manager.py --install")
            print(f"    4. python project_manager.py --reset-db")
            print()
            print(f"  {Colors.WARNING}Clean slate reset:{Colors.ENDC}")
            print(f"    python project_manager.py --all")
            print()

            print(f"{Colors.OKGREEN}For detailed help:{Colors.ENDC} python project_manager.py --help")
            print()

    except KeyboardInterrupt:
        print(f"\n{Colors.WARNING}Operation cancelled by user{Colors.ENDC}")
        sys.exit(0)
    except Exception as e:
        print(f"\n{Colors.FAIL}Error: {str(e)}{Colors.ENDC}")
        sys.exit(1)


if __name__ == '__main__':
    main()
