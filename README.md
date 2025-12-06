<div align="center">

#  Apna Parivar

> A secure, multi-tenant family tree platform that helps families connect, share, and preserve their history.

</div>

<div align="center">

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python 3.12+](https://img.shields.io/badge/python-3.12%2B-blue.svg)](https://www.python.org/downloads/)
[![Node.js 18+](https://img.shields.io/badge/node-18%2B-green.svg)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/fastapi-0.120%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/next.js-14%2B-000000.svg)](https://nextjs.org/)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Repository Layout](#repository-layout)
- [Quick Start](#quick-start)
- [Backend Setup](#backend-setup)
- [Docker & Deployment](#docker--deployment)
- [Development](#development)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [License](#license)
- [Support](#support)
- [Acknowledgments](#acknowledgments)

---

## Overview

**Apna-Parivar** (Our Family) is an open-source platform that enables families to build and maintain their family tree collaboratively. It provides secure role-based access, multi-tenant support, and an intuitive interface for managing family relationships and data.

This repository (Team 43) contains both the frontend (Next.js) and backend (FastAPI) components, ready for local development and production deployment via Docker and Render.

---

## Features

✨ **Core Capabilities:**
- 🌳 **Family Tree Management** — Create, update, and visualize family relationships
- 👥 **Multi-tenant Architecture** — Support for multiple families with complete data isolation
- 🔐 **Role-Based Access Control** — Super Admin, Family Admin, Co-Admin, and Family User roles
- 📱 **Responsive Design** — Works on desktop, tablet, and mobile
- 🔑 **Magic Link Authentication** — Passwordless sign-in via email
- 📧 **Email Verification** — Secure email-based user management
- 🔒 **Row-Level Security** — Database-enforced privacy at Supabase
- 📦 **Bulk Import** — Import family data in bulk

🚀 **Developer Features:**
- Docker & containerization support
- CI/CD workflows (GitHub Actions)
- Comprehensive API documentation (Swagger/ReDoc)
- Production-ready deployment to Render
- Well-structured codebase with clear separation of concerns

---

## Tech Stack

**Frontend:**
- [Next.js](https://nextjs.org/) 14+ — React framework
- TypeScript — Type-safe development
- Tailwind CSS — Utility-first styling
- Shadcn/ui — Component library

**Backend:**
- [FastAPI](https://fastapi.tiangolo.com/) 0.120+ — Python web framework
- [Supabase](https://supabase.com/) — PostgreSQL database + Auth
- [SQLAlchemy](https://www.sqlalchemy.org/) — ORM
- [Pydantic](https://docs.pydantic.dev/) — Data validation

**Infrastructure:**
- Docker — Containerization
- [Render](https://render.com/) — Cloud deployment
- GitHub Actions — CI/CD

---

## Repository Layout

```
Apna-Parivar/
├── backend/                   # FastAPI backend (Python 3.12+)
│   ├── app.py                # Main FastAPI application
│   ├── main.py               # Development entry point
│   ├── Dockerfile            # Multi-stage Docker image
│   ├── requirements.txt       # Python dependencies
│   ├── pyproject.toml        # Project metadata
│   ├── core/                 # Core modules (config, db, security)
│   ├── routers/              # API endpoints
│   ├── services/             # Business logic
│   ├── schemas/              # Pydantic models
│   └── sql/                  # Database schema & RLS policies
├── frontend/                 # Next.js frontend (React)
│   ├── app/                  # Next.js app router
│   ├── components/           # React components
│   ├── lib/                  # Utilities & helpers
│   ├── public/               # Static assets
│   └── package.json          # Node dependencies
├── docs/                     # Design docs, guides, implementation notes
├── .github/                  # GitHub Actions workflows
├── docker-compose.yml        # Local multi-container setup (optional)
├── LICENSE                   # MIT License
└── README.md                 # This file
```

---

## Quick Start

### Prerequisites

- **Python** 3.12 or later
- **Node.js** 18 or later
- **pip** (Python package manager)
- **npm** or **yarn** (Node package manager)
- **Docker** (optional, for containerized runs)
- **Supabase account** (for database and authentication)

### 1. Clone & Install

```bash
git clone https://github.com/Samcode2006/Apna-Parivar-Team-43.git
cd Apna-Parivar-Team-43
```

### 2. Configure Environment

Copy the example env file and fill in your Supabase credentials:

```bash
cd backend
cp .env.example .env
# Edit .env with your SUPABASE_URL, SUPABASE_KEY, SUPABASE_JWT_SECRET, etc.
```

### 3. Run Backend Locally

```bash
# Create virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # Windows PowerShell
# source .venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Start the server
python main.py
# Open http://localhost:8000/docs for API documentation
```

### 4. Run Frontend Locally

```bash
cd ../frontend
npm install
npm run dev
# Open http://localhost:3000
```

---

## Backend Setup

### Project Structure

### Database

The backend uses **Supabase** (managed PostgreSQL) for:
- User authentication (Supabase Auth)
- Data storage with Row-Level Security (RLS)
- Real-time capabilities (optional)

### API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Files

| File | Purpose |
|------|---------|
| `app.py` | FastAPI application, CORS setup, router registration |
| `main.py` | Development server entry point |
| `core/config.py` | Configuration and settings |
| `core/database.py` | Supabase client initialization |
| `core/security.py` | JWT token utilities |
| `sql/schema.sql` | Database tables and structure |
| `sql/rls_policies.sql` | Row-Level Security policies |

---

## Docker & Deployment

### Building Locally

The backend includes a **multi-stage Dockerfile** for optimized production builds:

```bash
# From repo root
docker build -f backend/Dockerfile -t apnaparivar-backend:local .
```

### Running in Docker

```bash
docker run --rm -p 8000:8000 \
  -e SUPABASE_URL="https://your-project.supabase.co" \
  -e SUPABASE_KEY="your-anon-key" \
  -e SUPABASE_JWT_SECRET="your-jwt-secret" \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e ENV="production" \
  apnaparivar-backend:local
```

### Deploying to Render

**Prerequisites:**
- Repository pushed to GitHub
- Render account and project created

**Steps:**

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for Render deployment"
   git push origin main
   ```

2. **Create Render Web Service:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click **New +** → **Web Service**
   - Select **Docker** as the deploy method
   - Connect your GitHub repository
   - Set build context to repository root

3. **Configure Environment Variables:**
   - In Render Dashboard, go to **Environment**
   - Add these variables:
     ```
     SUPABASE_URL          = https://your-project.supabase.co
     SUPABASE_KEY          = your-anon-key
     SUPABASE_JWT_SECRET   = your-jwt-secret
     DATABASE_URL          = postgresql://...
     ENV                   = production
     ```

4. **Deploy:**
   - Click **Create Web Service**
   - Render will build and deploy automatically

**Notes:**
- Render automatically assigns a port; the Dockerfile exposes 8000
- Health check is configured to run every 30 seconds
- For production, restrict CORS origins in `backend/app.py`

---

## Development

### Local Setup Checklist

- [ ] Python 3.12+ installed
- [ ] Supabase project created and credentials saved
- [ ] `.env` file configured with Supabase credentials
- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Database schema loaded (run SQL scripts in Supabase)

### Running Tests

```bash
cd backend
pytest
```

### Code Quality

```bash
# Linting
pylint backend/

# Formatting
black backend/

# Type checking
mypy backend/
```

### Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```

2. Make your changes and test locally

3. Commit with clear messages:
   ```bash
   git commit -m "feat: add family tree export"
   ```

4. Push and create a Pull Request:
   ```bash
   git push origin feature/your-feature
   ```

---

## Contributing

We welcome contributions! Whether you're fixing bugs, adding features, or improving documentation, your help makes Apna-Parivar better.

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style (Python: PEP 8, JavaScript: Prettier)
- Add tests for new functionality
- Update documentation as needed
- Keep PRs focused and well-described
- Be respectful and constructive in discussions

### Development Workflow

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Run linter
black . && pylint backend/

# Pre-commit hooks (optional)
pre-commit install
```

### Reporting Issues

Found a bug? Have a feature request? [Open an issue](../../issues) with:
- Clear description of the problem/idea
- Steps to reproduce (for bugs)
- Expected vs. actual behavior
- Screenshots (if applicable)
- Your environment (OS, Python version, etc.)

---

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

### Our Pledge

In the interest of fostering an open and welcoming environment, we as contributors and maintainers pledge to making participation in our project and our community a harassment-free experience for everyone.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

**MIT License Summary:**
- ✅ You can use, copy, modify, and distribute this software
- ✅ You can use it for commercial purposes
- ❌ You cannot hold the authors liable
- 📄 You must include the license and copyright notice

---

## Support

### Getting Help

- 📖 **Documentation**: Check [docs/](docs/) folder for guides and walkthroughs
- 💬 **Discussions**: [GitHub Discussions](../../discussions) for questions
- 🐛 **Bug Reports**: [GitHub Issues](../../issues) for bugs
- 📧 **Email**: [Your contact email]

### Useful Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Render Deployment Guide](https://render.com/docs)
- [Docker Documentation](https://docs.docker.com/)

---

## Troubleshooting

### Backend Issues

**Health check failing on startup:**
- Ensure all environment variables are set correctly
- Verify database connectivity from your environment
- Check Render logs in the dashboard

**CORS errors in frontend:**
- Update `CORS` origins in `backend/app.py` to match your frontend URL
- In production, avoid `allow_origins=["*"]`

**Dependencies not installing:**
- Clear pip cache: `pip cache purge`
- Reinstall: `pip install -r requirements.txt`
- Check Python version: `python --version` (should be 3.12+)

**Database connection issues:**
- Verify `DATABASE_URL` format in `.env`
- Check if Supabase project is active
- Ensure firewall/network allows connections

### Frontend Issues

- Clear `.next` cache: `rm -rf .next`
- Reinstall node_modules: `rm -rf node_modules && npm install`
- Check Node version: `node --version` (should be 18+)

### General Debugging

1. Check logs: `git log --oneline` to see recent changes
2. Review `.env` file for correct values (don't commit this!)
3. Test API with Swagger UI: http://localhost:8000/docs
4. Use browser DevTools for frontend issues

---

## Acknowledgments

### Contributors

Special thanks to all contributors who have helped shape this project:
- **Samarth S** — Project lead and core contributor
- **Team 43** — All team members who contributed to this platform

### Technologies & Libraries

- [FastAPI](https://fastapi.tiangolo.com/) — Modern web framework
- [Supabase](https://supabase.com/) — Open-source Firebase alternative
- [Next.js](https://nextjs.org/) — React framework
- [Pydantic](https://docs.pydantic.dev/) — Data validation
- [SQLAlchemy](https://www.sqlalchemy.org/) — Python ORM
- All open-source libraries in `requirements.txt` and `package.json`

### Inspiration

Built with ❤️ for families connecting across distances and generations.

---

## Quick Links

- 🌐 [Project Repository](https://github.com/Samcode2006/Apna-Parivar-Team-43)
- 📚 [Documentation](docs/)
- 🐛 [Report an Issue](../../issues)
- 💡 [Feature Request](../../issues)
- 📝 [Discussions](../../discussions)
- 👥 [Contributors](../../graphs/contributors)

---

## Changelog

See [CHANGELOG.md](docs/CHANGELOG.md) for a list of changes in each release.

---

<div align="center">

**Built with ❤️ by Neuratron**

*Preserving family👨‍👩‍👧‍👦 history, one tree at a time.*

Made with FastAPI, Next.js, and Supabase

[⬆ Back to top](#apna-parivar)

</div>
