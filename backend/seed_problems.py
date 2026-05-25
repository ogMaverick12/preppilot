"""
Seed Problems Script -- Populates the database with 50 algorithmic problems.
Run: python -m backend.seed_problems
"""
import asyncio
import json
import os
import sys
import io

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import async_session, init_db
from backend.models.problem import Problem


SEED_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "problems")
SEED_FILES = [
    os.path.join(SEED_DIR, "seed_problems.json"),
    os.path.join(SEED_DIR, "career_problems.json"),
    os.path.join(SEED_DIR, "community_challenges.json"),
    os.path.join(SEED_DIR, "event_local_challenges.json"),
]


async def seed():
    await init_db()

    problems = []
    for seed_file in SEED_FILES:
        if not os.path.exists(seed_file):
            continue
        with open(seed_file, "r", encoding="utf-8") as f:
            problems.extend(json.load(f))

    async with async_session() as db:
        count = 0
        for p in problems:
            from sqlalchemy import select
            existing = await db.execute(select(Problem).where(Problem.slug == p["slug"]))
            if existing.scalar_one_or_none():
                print(f"  [SKIP] Skipping (exists): {p['title']}")
                continue

            problem = Problem(
                external_id=p.get("external_id"),
                title=p["title"],
                slug=p["slug"],
                difficulty=p["difficulty"],
                topic=p["topic"],
                sub_topic=p.get("sub_topic"),
                description=p["description"],
                examples=json.dumps(p.get("examples", [])),
                constraints=json.dumps(p.get("constraints", [])),
                hints=json.dumps(p.get("hints", [])),
                solution_approach=p.get("solution_approach"),
                time_complexity=p.get("time_complexity"),
                space_complexity=p.get("space_complexity"),
                source_url=p.get("source_url"),
                tags=json.dumps(p.get("tags", [])),
                owner_user_id=p.get("owner_user_id"),
                is_custom=bool(p.get("is_custom", False)),
            )
            db.add(problem)
            count += 1
            print(f"  [OK] [{count:02d}/{len(problems)}] {p['title']} ({p['difficulty']})")

        await db.commit()
        print(f"\nSeeded {count} new problems into the database.")


if __name__ == "__main__":
    print("PrepPilot -- Seeding problem bank...\n")
    asyncio.run(seed())
