# Contributing to PrepPilot

Thank you for your interest in contributing! PrepPilot is an open-source project and we welcome contributions from the community.

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.11+
- **Git**

### Development Setup

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/prep-pilot.git
cd prep-pilot

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..

# Seed the database
python -m backend.seed_problems

# Frontend setup
cd frontend
npm install
cd ..

# Copy environment config
cp .env.example .env
```

### Running Locally

```bash
# Terminal 1: Backend
uvicorn backend.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend && npm run dev
```

## 📋 Development Guidelines

### Code Style

**Python (Backend)**
- Follow PEP 8
- Use type hints for all function signatures
- Async functions for all database operations
- Docstrings for all public functions

**TypeScript (Frontend)**
- No `any` types — full type definitions required
- Use functional components with hooks
- Follow the existing component patterns in `components/`

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add weekly report email template
fix: correct radar chart axis alignment
docs: update API reference for sessions
refactor: extract score calculation to utility
```

### Branch Strategy

```
main          ← production-ready
├── dev       ← integration branch
│   ├── feat/skill-evolution-v2
│   ├── fix/telegram-webhook-retry
│   └── docs/api-reference-update
```

## 🏗️ Architecture Overview

| Directory | Owner | Description |
|-----------|-------|-------------|
| `frontend/` | Frontend | Next.js 14 dashboard |
| `backend/models/` | Backend | SQLAlchemy ORM models |
| `backend/routers/` | Backend | FastAPI route handlers |
| `backend/services/` | Backend | Business logic & integrations |
| `hermes/skills/` | Agent | Self-improving skill files |
| `hermes/scripts/` | Agent | Cron job scripts |
| `data/` | Data | Problem bank & seed data |

## 🧪 Testing

```bash
# Backend tests
cd backend && python -m pytest

# Frontend build check
cd frontend && npm run build

# Lint
cd frontend && npm run lint
```

## 🐛 Reporting Issues

Please include:
1. **What happened** vs **what you expected**
2. **Steps to reproduce**
3. **Environment** (OS, Python version, Node version)
4. **Screenshots** if UI-related

## 📝 Pull Request Process

1. Fork → Branch → Code → Test → PR
2. Fill out the PR template completely
3. Ensure all checks pass
4. One approval required for merge

---

<p align="center">
  <sub>Thank you for helping make PrepPilot better! 🎯</sub>
</p>
