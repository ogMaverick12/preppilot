"""
PrepPilot — FastAPI Backend Application
========================================
Self-improving technical interview coaching system powered by Hermes Agent.
"""
import json
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database import init_db
from backend.routers import auth, dashboard, hermes, problems, sessions, users, webhooks


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create tables, initialize Hermes Agent. Shutdown: cleanup."""
    await init_db()

    # Initialize the Hermes Agent — load config, seed skill files
    from backend.database import async_session
    from backend.services import hermes_agent
    async with async_session() as db:
        await hermes_agent.initialize(db)

    yield


app = FastAPI(
    title="PrepPilot API",
    description="Self-improving technical interview coaching system powered by Hermes Agent.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://preppilot.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(users.router,     prefix="/api/v1/users",     tags=["Users"])
app.include_router(auth.router,      prefix="/api/v1/auth",      tags=["Auth"])
app.include_router(problems.router,  prefix="/api/v1/problems",  tags=["Problems"])
app.include_router(sessions.router,  prefix="/api/v1/sessions",  tags=["Sessions"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(hermes.router,    prefix="/api/v1/hermes",    tags=["Hermes"])
app.include_router(webhooks.router,  prefix="/api/v1/webhooks",  tags=["Webhooks"])


@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "PrepPilot API",
        "version": "1.0.0",
        "status": "operational",
        "agent": "Hermes Agent v1.4",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}
