#!/usr/bin/env python3
"""
MindFlow Platform - Project Manager Script
Handles database reset, dependency cleanup, and project organization

This script provides a comprehensive suite of utilities for:
- Database management (reset, migrate, seed)
- Dependency cleanup (node_modules, package-lock files)
- Project file organization and review
- Environment validation
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
    # DATABASE OPERATIONS
    # =========================================================================

    def reset_database(self, skip_seed: bool = False):
        """Reset the database: drop, migrate, and seed"""
        self.print_header("Database Reset")

        if not self.confirm_action("⚠️  This will DELETE ALL DATA! Continue?", default=False):
            self.print_info("Database reset cancelled")
            return

        try:
            # Stop database
            self.print_info("[1/5] Stopping database...")
            self.run_command(['docker', 'compose', 'down'])
            self.print_success("Database stopped")

            # Delete volume
            self.print_info("[2/5] Deleting database volume...")
            self.run_command(['docker', 'volume', 'rm', 'salesteamone_postgres_data'],
                           check=False)
            self.print_success("Database volume deleted")

            # Start database
            self.print_info("[3/5] Starting database...")
            self.run_command(['docker', 'compose', 'up', '-d'])
            self.print_info("Waiting for database to be ready...")
            import time
            time.sleep(5)
            self.print_success("Database started")

            # Run migrations
            self.print_info("[4/5] Running migrations...")
            env = os.environ.copy()
            env['PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING'] = '1'

            # Generate Prisma client
            self.run_command(['npm', 'run', 'prisma:generate'],
                           cwd=self.backend_dir, shell=True)

            # Run migration
            self.run_command(['npm', 'run', 'prisma:migrate'],
                           cwd=self.backend_dir, shell=True)
            self.print_success("Migrations completed")

            # Seed database
            if not skip_seed:
                self.print_info("[5/5] Seeding database...")
                self.run_command(['npm', 'run', 'prisma:seed'],
                               cwd=self.backend_dir, shell=True)
                self.print_success("Database seeded")
            else:
                self.print_info("[5/5] Skipping seed (as requested)")

            self.print_success("\n✨ Database reset complete!")

        except Exception as e:
            self.print_error(f"Database reset failed: {str(e)}")
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

    def install_dependencies(self):
        """Install all project dependencies"""
        self.print_header("Install Dependencies")

        try:
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
        '''
    )

    parser.add_argument('--reset-db', action='store_true',
                       help='Reset database (drop, migrate, seed)')
    parser.add_argument('--no-seed', action='store_true',
                       help='Skip seeding when resetting database')
    parser.add_argument('--seed', action='store_true',
                       help='Seed database only')
    parser.add_argument('--clean', action='store_true',
                       help='Clean node_modules folders')
    parser.add_argument('--full', action='store_true',
                       help='Full clean (includes package-lock files)')
    parser.add_argument('--install', action='store_true',
                       help='Install all dependencies')
    parser.add_argument('--analyze', action='store_true',
                       help='Analyze project structure')
    parser.add_argument('--organize-docs', action='store_true',
                       help='Organize documentation files')
    parser.add_argument('--report', action='store_true',
                       help='Generate project status report')
    parser.add_argument('--studio', action='store_true',
                       help='Open Prisma Studio')
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

        # If no arguments, show help
        if not any(vars(args).values()):
            parser.print_help()

    except KeyboardInterrupt:
        print(f"\n{Colors.WARNING}Operation cancelled by user{Colors.ENDC}")
        sys.exit(0)
    except Exception as e:
        print(f"\n{Colors.FAIL}Error: {str(e)}{Colors.ENDC}")
        sys.exit(1)


if __name__ == '__main__':
    main()
