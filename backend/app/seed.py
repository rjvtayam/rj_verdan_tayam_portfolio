"""Idempotent seed: admin user, projects, posts, skills, experiences.

Run with: uv run python -m app.seed [--refresh]
--refresh clears projects/skills/experiences first (keeps posts, testimonials, messages).
"""

import asyncio
import sys
from datetime import date, datetime, timezone

from sqlalchemy import delete, select

from app.core.config import settings
from app.core.security import hash_password
from app.db import SessionLocal
from app.models import (
    Experience,
    Post,
    Project,
    ProjectTag,
    ProjectVote,
    Skill,
    Tag,
    Testimonial,
    User,
)


def _slugify(title: str) -> str:
    return title.lower().replace(" ", "-").replace("/", "-")


PROJECTS = [
    {
        "title": "JNHS Portal",
        "summary": "Full school management portal for Jomalig National High School — seven role types, DepEd-compliant grading and generated report cards.",
        "problem": "Enrollment, grading and attendance lived on paper forms and disconnected spreadsheets, so teachers, registrar and administration never shared one source of truth.",
        "approach": "FastAPI + PostgreSQL backend with role-scoped workflows for Super Admin, Admin, Principal, Teacher, Student, Parent and Registrar. DepEd K-12 grading with component weights (Written Work 30%, Performance Tasks 50%, Quarterly Assessment 20%) and automatic grade transmutation. LRN-based student records, quarterly grade management, daily attendance and section-based enrollment, with SF9 and SF10 report cards generated straight from the database. A Super Admin monitoring panel surfaces error logs, system health and user distribution analytics.",
        "results": [
            {"label": "Role types served", "value": "7"},
            {"label": "Grading components weighted", "value": "3"},
            {"label": "DepEd report cards", "value": "SF9 + SF10"},
        ],
        "tech_stack": ["Python", "FastAPI", "PostgreSQL", "JavaScript", "HTML5"],
        "featured": True,
        "rating": 5,
        "tags": ["fastapi", "postgresql", "education", "deped"],
        "demo_url": None,
        "repo_url": None,
    },
    {
        "title": "Farm Connect",
        "summary": "Multi-panel web application that digitalizes RSBSA farmer registration and approval for the Mabitac, Laguna municipal agriculture office.",
        "problem": "RSBSA farmer registration ran on paper forms; approvals stalled at the municipal office with no live view of application status.",
        "approach": "Flask + PostgreSQL with a strict role-based access model across four dedicated panels — Encoder, Verifier, MAO and Admin — each with scoped permissions and workflows. Real-time dashboard updates over Socket.IO remove manual page refreshes on live data feeds. Government PDF reports generate directly from web form data. Glassmorphism UI with dark/light themes, micro-animations and fully responsive layouts, secured with encrypted authentication, CSRF protection and role-based routing.",
        "results": [
            {"label": "Role panels", "value": "4"},
            {"label": "Live dashboards", "value": "Socket.IO"},
            {"label": "Reports", "value": "Auto PDF"},
        ],
        "tech_stack": ["Python", "Flask", "PostgreSQL", "JavaScript", "Socket.IO"],
        "featured": True,
        "rating": 5,
        "tags": ["flask", "postgresql", "realtime", "government"],
        "demo_url": None,
        "repo_url": None,
    },
    {
        "title": "Enlighten ED",
        "summary": "Student courseware and skill-tracking system with an integrated AI helper for answering queries and finding resources.",
        "problem": "Students had no single place for course materials, skill progress, or quick answers to coursework questions.",
        "approach": "Led full-stack development on Python + PostgreSQL, keeping student records secure with a careful data model. An AI helper feature assists students with answering queries and discovering resources, and the functional prototype validates the courseware and skill-tracking workflow end to end.",
        "results": [
            {"label": "AI helper for Q&A", "value": "Built-in"},
            {"label": "Skill tracking", "value": "Per student"},
            {"label": "Status", "value": "Functional prototype"},
        ],
        "tech_stack": ["Python", "PostgreSQL", "HTML5", "AI Integration"],
        "featured": False,
        "rating": 4,
        "tags": ["python", "postgresql", "ai", "education"],
        "demo_url": None,
        "repo_url": None,
    },
    {
        "title": "Zuitt CodeCamp Web App",
        "summary": "Bootcamp capstone web application — awarded the Star Web Development & UX/UI Design Award for best implementation and code quality.",
        "problem": "The capstone brief required connecting a Python backend to a MySQL database behind a polished, responsive interface — on a bootcamp timeline.",
        "approach": "Served as backend developer: built the dynamic data layer in Python wired to MySQL, with clean structure and implementation craft judged on code quality. The project took the Zuitt Star Web Development & UX/UI Design Award in 2024.",
        "results": [
            {"label": "Award", "value": "Star Award"},
            {"label": "Awarded", "value": "2024"},
            {"label": "Role", "value": "Backend"},
        ],
        "tech_stack": ["Python", "MySQL", "HTML5"],
        "featured": False,
        "rating": 5,
        "tags": ["python", "mysql", "award"],
        "demo_url": None,
        "repo_url": None,
    },
    {
        "title": "RJVT Portfolio Platform",
        "summary": "This portfolio — a full-stack platform with a JWT admin CMS, public testimonials with avatar uploads, visitor voting and a neon design system.",
        "problem": "A portfolio should be maintained without a developer, and it should demonstrate the exact engineering it claims to sell.",
        "approach": "React 19 + Vite + Tailwind v4 SPA against a versioned FastAPI service; async SQLAlchemy with Alembic migrations; JWT + argon2 admin console covering projects, posts, skills, experiences, messages and testimonials; anonymous per-visitor voting backed by unique constraints; rate-limited public endpoints and multipart avatar uploads served from static storage. Docker Compose for local prod-parity, strict TypeScript on the client and a pytest suite on the server.",
        "results": [
            {"label": "Backend tests passing", "value": "15/15"},
            {"label": "Lint + type errors", "value": "0"},
            {"label": "Admin surfaces", "value": "6"},
        ],
        "tech_stack": ["React", "TypeScript", "FastAPI", "PostgreSQL", "Tailwind CSS", "Docker"],
        "featured": True,
        "rating": 5,
        "tags": ["react", "fastapi", "postgresql", "portfolio"],
        "demo_url": None,
        "repo_url": None,
    },
    {
        "title": "LSPU-BAO Portal",
        "summary": "Ordering and service portal for LSPU-BAO, the Laguna State Polytechnic University bookkeeping and supplies office — streamlining how students and faculty access essential resources.",
        "problem": "The BAO office served students and faculty through walk-in requests only; supplies availability and order status lived in logbooks, so people queued without knowing whether their items were ready.",
        "approach": "Built a web portal for the office with product/catalog browsing, order placement and status tracking, backed by a Python service layer and SQL database. The interface keeps the flow simple for first-time users — browse, request, receive updates — while staff manage inventory and fulfill orders from a dedicated panel.",
        "results": [
            {"label": "Campus offices served", "value": "LSPU-BAO"},
            {"label": "Order flow", "value": "Browse → request → track"},
            {"label": "Access", "value": "Students & faculty"},
        ],
        "tech_stack": ["Python", "MySQL", "JavaScript", "HTML5", "CSS3"],
        "featured": False,
        "rating": 5,
        "tags": ["python", "mysql", "education", "campus"],
        "demo_url": None,
        "repo_url": None,
    },
    {
        "title": "Dreamland Arcade Management System",
        "summary": "Full-stack management platform for two arcade branches — role-based dashboards, POS terminal, scheduling and inventory, with branch data isolation enforced by PostgreSQL Row-Level Security.",
        "problem": "Two branches (Siniloan and Infanta) ran employees, schedules, POS sales, inventory and payroll on paper and disconnected spreadsheets — with no privacy boundary between branches and no single login for staff.",
        "approach": "FastAPI + SQLAlchemy backend over 28 PostgreSQL tables, with Row-Level Security on 20 of them: every request sets app.current_branch_id and app.current_user_role session variables, so branch isolation is enforced by the database itself rather than application checks. PIN + JWT auth with bcrypt hashing, a five-attempt login throttle and per-IP rate limits behind a six-middleware security stack. 22 route modules cover attendance with an auto-reshuffle scheduling algorithm, POS with loyalty cards and cash tracking sheets, inventory, payslips, proposals, announcements and Gmail SMTP/IMAP messaging; a hash-routed vanilla-JS SPA with 30+ page renderers serves Owner, Admin and Employee roles under a neon Orbitron arcade theme, with Chart.js revenue analytics on the owner dashboard.",
        "results": [
            {"label": "Branches isolated at DB level", "value": "2"},
            {"label": "Tables protected by RLS", "value": "20"},
            {"label": "Role-based surfaces", "value": "4"},
        ],
        "tech_stack": ["Python", "FastAPI", "PostgreSQL", "SQLAlchemy", "JavaScript", "Chart.js"],
        "featured": False,
        "rating": 5,
        "tags": ["fastapi", "postgresql", "security", "pos"],
        "demo_url": None,
        "repo_url": "https://github.com/rjvtayam/dreamland_arcade_project",
    },
]

POSTS = [
    {
        "title": "Structuring a FastAPI + React monorepo that scales",
        "excerpt": "How I keep API contracts, migrations, and UI in one repo without chaos.",
        "content_md": """## Why a monorepo

A portfolio project is the perfect place to prove you can structure a real system. I keep `frontend/` and `backend/` side by side so a single `git clone` gives a reviewer the whole product.

## Rules that keep it clean

1. **Routers stay thin.** Every route delegates to a service function.
2. **One API client.** The frontend never calls `fetch` directly; it goes through `lib/api.ts` so types come from one place.
3. **Migrations are law.** Alembic generates every schema change — no `create_all` in production.

```bash
alembic revision --autogenerate -m "add messages index"
alembic upgrade head
```

## The payoff

`docker compose up` starts a reviewer-ready stack in under a minute, and CI can run backend tests and a frontend build from the same pipeline.
""",
        "tags": ["fastapi", "architecture"],
    },
    {
        "title": "PostgreSQL indexes that actually matter for CRUD apps",
        "excerpt": "Composite, partial, and GIN indexes — with the queries that justify them.",
        "content_md": """## Start from the query

An index is a bet on a query pattern. For a portfolio site the winning bets are:

- **List + filter**: composite index on `(status, created_at DESC)` covers "published projects, newest first".
- **Tag joins**: the `project_tags` junction is small but hot — its primary key already doubles as an index.
- **Search**: `pg_trgm` GIN indexes make `ILIKE '%term%'` usable at scale.

```sql
CREATE INDEX idx_projects_status_created
  ON projects (status, created_at DESC);
```

## Measure, then keep

`EXPLAIN (ANALYZE, BUFFERS)` before and after. If a plan doesn't touch the index, delete it — every index is a write tax.
""",
        "tags": ["postgresql", "performance"],
    },
    {
        "title": "Server state deserves its own layer: TanStack Query",
        "excerpt": "Why I removed most of my useEffect code when I moved to a query cache.",
        "content_md": """## The old reflex

Fetch in `useEffect`, stash in `useState`, remember to clear loading flags, forget to handle the error. Repeat across forty components.

## The shift

TanStack Query treats server data as a cache with a lifecycle: stale-while-revalidate, retries, pagination, and invalidation on mutation.

```ts
const { data } = useQuery({
  queryKey: ["projects"],
  queryFn: () => api.projects.list(),
});
```

Mutations invalidate the key, every subscriber re-renders with fresh data, and the UI never flashes a spinner for a cache hit.

## Result

Fewer bugs, less boilerplate, and optimistic updates that roll back cleanly when the API says no.
""",
        "tags": ["react", "typescript"],
    },
    {
        "title": "Designing responsive layouts on purpose",
        "excerpt": "Fluid type, one spacing scale, and a viewport matrix that catches overflow.",
        "content_md": """## Mobile first is an ordering, not a target

Base styles target 360px. Each breakpoint *adds* structure — a two-column grid at `md`, a sticky sidebar at `lg` — never rescues a broken layout.

## Fluid type with clamp()

```css
--text-display: clamp(2.5rem, 1.2rem + 4vw, 4.5rem);
```

Headlines scale continuously instead of jumping at arbitrary widths.

## Prove it

I test every page at 360 / 390 / 768 / 1024 / 1440 px and assert no horizontal scroll in an automated viewport matrix. If the art direction breaks the layout at 360px, the art direction loses.
""",
        "tags": ["css", "responsive"],
    },
]

SKILLS = [
    # Frontend
    {"name": "HTML5 & CSS3", "category": "Frontend", "proficiency": 5, "order": 1},
    {"name": "JavaScript", "category": "Frontend", "proficiency": 5, "order": 2},
    {"name": "React.js", "category": "Frontend", "proficiency": 5, "order": 3},
    {"name": "TypeScript", "category": "Frontend", "proficiency": 4, "order": 4},
    {"name": "Tailwind CSS", "category": "Frontend", "proficiency": 4, "order": 5},
    # Backend
    {"name": "Python", "category": "Backend", "proficiency": 5, "order": 6},
    {"name": "FastAPI", "category": "Backend", "proficiency": 4, "order": 7},
    {"name": "Flask", "category": "Backend", "proficiency": 4, "order": 8},
    {"name": "Node.js", "category": "Backend", "proficiency": 4, "order": 9},
    {"name": "PHP", "category": "Backend", "proficiency": 3, "order": 10},
    # Databases
    {"name": "PostgreSQL", "category": "Database", "proficiency": 5, "order": 11},
    {"name": "MySQL", "category": "Database", "proficiency": 4, "order": 12},
    {"name": "MongoDB", "category": "Database", "proficiency": 3, "order": 13},
    # Mobile
    {"name": "Flutter", "category": "Mobile", "proficiency": 4, "order": 14},
    {"name": "Kotlin", "category": "Mobile", "proficiency": 3, "order": 15},
    # Design
    {"name": "Figma", "category": "Design / UI", "proficiency": 4, "order": 16},
    {"name": "Adobe Photoshop", "category": "Design / UI", "proficiency": 4, "order": 17},
    {"name": "Adobe Illustrator", "category": "Design / UI", "proficiency": 3, "order": 18},
    {"name": "Adobe XD", "category": "Design / UI", "proficiency": 3, "order": 19},
    # Tools
    {"name": "Git & GitHub", "category": "Tools", "proficiency": 5, "order": 20},
]

EXPERIENCES = [
    {
        "company": "Self-Employed / Remote",
        "role": "Freelance Full-Stack Developer",
        "start_date": date(2026, 1, 1),
        "end_date": None,
        "bullets": [
            "Built and deployed custom web applications for clients using React, Next.js, Python, PHP/MySQL and PostgreSQL.",
            "Created logos, mockups and user interfaces in Figma, Adobe Illustrator and Photoshop — from mockups to deployment.",
            "Managed end-to-end delivery: client requirement gathering through development to final deployment.",
            "Led full-stack builds for school and municipal systems (JNHS Portal, Farm Connect) with role-based access control and generated reports.",
        ],
        "order": 1,
    },
    {
        "company": "Open Source",
        "role": "Contributor",
        "start_date": date(2022, 6, 1),
        "end_date": None,
        "bullets": [
            "Contributed fixes and documentation to Python and React ecosystem projects.",
            "Reviewed PRs with a focus on API ergonomics and test coverage.",
        ],
        "order": 2,
    },
]

# REAL testimonials from past collaborators (avatars served from frontend public/media).
TESTIMONIALS = [
    {
        "name": "Reymar Villana",
        "role": "Student",
        "rating": 5,
        "quote": "RJ was a fantastic developer to work with! He delivered exactly what we needed.",
        "avatar_url": "/media/testimonials/reymar-villana.jpg",
    },
    {
        "name": "Marchie Tan",
        "role": "IWC Supervisor",
        "rating": 5,
        "quote": "Working with RJ on our project was seamless and professional. Highly recommend!",
        "avatar_url": "/media/testimonials/marchie-tan.jpg",
    },
    {
        "name": "Richmond Mendez",
        "role": "Civil Engineer",
        "rating": 5,
        "quote": "RJ has a great understanding of user needs, and his designs are fantastic.",
        "avatar_url": "/media/testimonials/richmond-mendez.jpg",
    },
]


async def seed(refresh: bool = False) -> None:
    async with SessionLocal() as db:
        email = settings.ADMIN_EMAIL.lower()
        existing = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
        if existing is None:
            db.add(User(email=email, password_hash=hash_password(settings.ADMIN_PASSWORD), role="admin"))
            print(f"[seed] admin user: {email}")
        else:
            print("[seed] admin user already exists")

        if refresh:
            await db.execute(delete(ProjectTag))
            await db.execute(delete(ProjectVote))
            await db.execute(delete(Project))
            await db.execute(delete(Skill))
            await db.execute(delete(Experience))
            await db.commit()
            print("[seed] refresh: cleared projects, skills, experiences (kept posts, testimonials, messages)")

        seeded_slugs = set((await db.execute(select(Project.slug))).scalars().all())
        inserted = 0
        for raw in PROJECTS:
            slug = _slugify(raw["title"])
            if slug in seeded_slugs:
                continue
            tag_objs = []
            for name in raw["tags"]:
                result = await db.execute(select(Tag).where(Tag.name == name))
                tag = result.scalar_one_or_none()
                if tag is None:
                    tag = Tag(name=name)
                    db.add(tag)
                    await db.flush()
                tag_objs.append(tag)
            project = Project(
                slug=slug,
                title=raw["title"],
                summary=raw["summary"],
                problem=raw["problem"],
                approach=raw["approach"],
                results=raw["results"],
                tech_stack=raw["tech_stack"],
                featured=raw["featured"],
                rating=raw.get("rating"),
                repo_url=raw.get("repo_url"),
                demo_url=raw.get("demo_url"),
                status="published",
                tags=tag_objs,
            )
            db.add(project)
            inserted += 1
        if inserted:
            print(f"[seed] inserted {inserted} new projects ({len(seeded_slugs)} already present)")

        if (await db.execute(select(Post))).first() is None:
            for raw in POSTS:
                db.add(
                    Post(
                        slug=_slugify(raw["title"]),
                        title=raw["title"],
                        excerpt=raw["excerpt"],
                        content_md=raw["content_md"],
                        tags=raw["tags"],
                        status="published",
                        published_at=datetime.now(timezone.utc),
                    )
                )
            print(f"[seed] {len(POSTS)} posts")

        if (await db.execute(select(Skill))).first() is None:
            for raw in SKILLS:
                db.add(Skill(**raw))
            print(f"[seed] {len(SKILLS)} skills")

        if (await db.execute(select(Experience))).first() is None:
            for raw in EXPERIENCES:
                db.add(Experience(**raw))
            print(f"[seed] {len(EXPERIENCES)} experiences")

        # testimonials: replace fictional placeholders with real quotes, add any missing by name
        placeholder_names = {"Maria Santos", "Jerome Cruz", "A. Reyes"}
        await db.execute(delete(Testimonial).where(Testimonial.name.in_(placeholder_names)))
        existing_names = set((await db.execute(select(Testimonial.name))).scalars().all())
        inserted_t = 0
        for raw in TESTIMONIALS:
            if raw["name"] in existing_names:
                continue
            db.add(Testimonial(**raw, status="published"))
            inserted_t += 1
        if inserted_t:
            print(f"[seed] inserted {inserted_t} real testimonials")
        else:
            print("[seed] testimonials already present, skipping")
        await db.commit()


if __name__ == "__main__":
    asyncio.run(seed(refresh="--refresh" in sys.argv))
