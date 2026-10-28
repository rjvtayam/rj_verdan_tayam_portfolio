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
            {"label": "Component weight split", "value": "30/50/20"},
            {"label": "Quarterly grading periods", "value": "4"},
            {"label": "Monitoring analytics views", "value": "3"},
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
            {"label": "Security mechanisms", "value": "3"},
            {"label": "UI themes", "value": "Dark + Light"},
            {"label": "Manual page refreshes", "value": "0"},
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
            {"label": "Core features", "value": "3"},
            {"label": "Database", "value": "PostgreSQL"},
            {"label": "Validation", "value": "End to end"},
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
            {"label": "Backend language", "value": "Python"},
            {"label": "Database", "value": "MySQL"},
            {"label": "Award disciplines", "value": "Web + UX/UI"},
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
            {"label": "Type safety", "value": "Strict"},
            {"label": "Auth stack", "value": "JWT + argon2"},
            {"label": "Deployment", "value": "Docker Compose"},
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
            {"label": "Order states", "value": "4"},
            {"label": "Trust levels", "value": "2"},
            {"label": "Service layer", "value": "Python"},
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
            {"label": "PostgreSQL tables", "value": "28"},
            {"label": "Security middleware", "value": "6"},
            {"label": "Route modules", "value": "22"},
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
        "project_slug": None,
        "level": "intermediate",
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
        "project_slug": None,
        "level": "advanced",
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
        "project_slug": None,
        "level": "intermediate",
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
        "project_slug": None,
        "level": "beginner",
        "tags": ["css", "responsive"],
    },
    {
        "title": "Enforcing multi-branch data isolation with PostgreSQL Row-Level Security",
        "excerpt": "How the Dreamland Arcade platform keeps two branches' data apart at the database layer, not in application code.",
        "content_md": """## The problem

Dreamland Arcade runs two branches — Siniloan and Infanta — on one database. Employees, schedules, POS sales, inventory and payroll all live in the same 28 tables. The tempting shortcut is to filter branch data in application code: `WHERE branch_id = ?` on every query. It works right up until one route forgets the filter, and branch B's nightly revenue lands on branch A's owner dashboard. With money and payroll involved, a silent cross-branch leak is the worst possible failure.

## Let the database enforce it

I enabled Row-Level Security on the 20 tables that hold branch-scoped data and forced it on, so it applies even to table owners:

```sql
ALTER TABLE pos_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_sales FORCE ROW LEVEL SECURITY;
```

Every request opens a transaction that sets two session variables before any query runs:

```sql
SET LOCAL app.current_branch_id = :branch_id;
SET LOCAL app.current_user_role = :role;
```

A policy then decides visibility, per table and per operation. Read access is scoped to the branch, and writes carry the same guard:

```sql
CREATE POLICY branch_isolation ON pos_sales
  USING (branch_id = current_setting('app.current_branch_id')::int)
  WITH CHECK (branch_id = current_setting('app.current_branch_id')::int);
```

The `WITH CHECK` clause matters as much as `USING`: it stops a row from being *inserted* under the wrong branch, not just read across one.

## Why it holds

The isolation no longer depends on developer discipline. A forgotten `WHERE` clause returns zero rows instead of another branch's data, and an `INSERT` with the wrong branch id is rejected by the database. Because `SET LOCAL` is scoped to the transaction, a pooled connection never carries one branch's identity into the next request — the variables die with the transaction, so there is no state to leak between users.

## What it cost, and how I checked it

RLS adds a planner filter to every protected query. Across 20 tables that meant indexing `branch_id` everywhere and re-checking plans with `EXPLAIN (ANALYZE, BUFFERS)` to confirm the policies did not turn a index scan into a sequential one. I also wrote a test that logs in as a branch-A user and asserts a branch-B row comes back empty — the policy is only trustworthy once it has failed a query you expected to succeed. The trade was worth it: a privacy boundary belongs in the layer least likely to make a mistake.
""",
        "project_slug": "dreamland-arcade-management-system",
        "level": "advanced",
        "tags": ["postgresql", "security"],
    },
    {
        "title": "Designing a six-middleware security stack in FastAPI",
        "excerpt": "PIN, bcrypt, JWT, throttling and per-IP limits — layered as six small guards instead of one big authenticate().",
        "content_md": """## Six layers, one login

The arcade platform handles money, payroll and staff identities, so authentication is not a single `if`. A request crosses six middleware layers before it reaches a route, and each one is small enough to reason about on its own:

1. **Origin checks** — reject cross-site requests that did not come from the app.
2. **Per-IP rate limiting** — cap request volume before any expensive work runs.
3. **Session parsing** — decode the token and attach the raw claims.
4. **PIN verification** — on login only, check the credential against its hash.
5. **JWT validation** — signature and expiry, so a tampered token never reaches a handler.
6. **Role resolution** — map the validated identity to a role the route can gate on.

Ordering is the whole design. Cheap rejections (origin, rate limit) run before costly ones (bcrypt, validation), so an attacker cannot use the login endpoint as a denial-of-service lever.

## PINs, not passwords

Staff wanted something faster than a password on a shared front-desk machine, so the credential is a PIN hashed with bcrypt:

```python
pin_hash = bcrypt.hashpw(pin.encode(), bcrypt.gensalt())
ok = bcrypt.checkpw(pin_attempt.encode(), pin_hash)
```

Bcrypt's per-hash salt and adjustable cost mean stolen rows are not cheaply brute-forced, which matters more than length rules on a four-to-six digit PIN.

## Brute force is a solved problem

A PIN is guessable, so guessing has to be expensive. A five-attempt throttle per account, layered on top of per-IP rate limits, turns an online attack into a slow crawl:

```python
if attempts >= 5:
    raise HTTPException(423, "Account temporarily locked")
```

The two limits catch different adversaries: the per-account throttle stops a targeted guess at one PIN, and the per-IP limit stops a script spraying many accounts.

## The lesson

Each layer does one thing. When a bug showed up in role resolution, I patched one middleware without touching auth, and the other five kept their guarantees. Small, composable guards are far easier to reason about — and to test — than one large `authenticate()` that does everything, and they fail in ways you can predict.
""",
        "project_slug": "dreamland-arcade-management-system",
        "level": "advanced",
        "tags": ["fastapi", "security"],
    },
    {
        "title": "An auto-reshuffle scheduling algorithm for arcade staff",
        "excerpt": "Turning attendance into fair shift reassignment instead of a weekly spreadsheet the owner redraws by hand.",
        "content_md": """## Scheduling by hand doesn't scale

With two branches and rotating shifts, the owner built schedules in a spreadsheet every week. When someone called in sick, the whole grid had to be redrawn by hand — usually while the branch was already short-staffed and busy. The schedule was also unfair in a way nobody noticed: the same reliable employees kept getting the extra hours, because they were the first name the owner thought of.

## The reshuffle trigger

Attendance feeds the scheduler. A no-show marks the shift as open, and the algorithm reassigns it instead of paging a human. The core is deliberately small:

```python
def reshuffle(branch_id, open_shift):
    eligible = [
        e for e in employees(branch_id)
        if e.id != open_shift.owner_id
        and e.can_cover(open_shift.role)
        and e.hours_this_week + open_shift.hours <= e.max_hours
    ]
    if not eligible:
        return None  # escalate to the owner
    best = min(eligible, key=lambda e: e.hours_this_week)
    assign(open_shift, best)
    return best
```

## Fairness as the objective

The `min(..., key=hours_this_week)` line is the whole policy: the shift goes to the eligible employee with the fewest hours this week, so load spreads evenly instead of landing on the same reliable person every time. That single key function quietly fixed the unfairness the spreadsheet had been hiding — no one has to advocate for a fairer roster, because fairness is the selection criterion.

## Guardrails and escalation

The algorithm is intentionally conservative. It respects maximum-hours rules, never reassigns across branches — the same row-level security that isolates sales also isolates staff — and returns `None` when nobody is eligible rather than forcing a bad fit. That `None` is important: an unfillable shift escalates to the owner instead of quietly overworking someone. Every change writes an audit row, so the owner can see exactly why a schedule moved and override it when the algorithm lacks context a human has.
""",
        "project_slug": "dreamland-arcade-management-system",
        "level": "intermediate",
        "tags": ["python", "architecture"],
    },
    {
        "title": "Modeling DepEd K-12 grading with role-scoped workflows",
        "excerpt": "Encoding weighted components, transmutation and SF9/SF10 generation so seven roles share one source of truth.",
        "content_md": """## Grading is a policy, not a formula

DepEd K-12 grading is not "average the scores." Each quarterly grade is a weighted sum of three components, then transmuted to the 75–100 scale the report card prints. When that policy lives in a spreadsheet, every teacher computes it slightly differently, and the registrar cannot audit any of it. The fix is to encode the policy once and make every role read the same numbers.

## The weights, encoded once

| Component | Weight |
| --- | --- |
| Written Work | 30% |
| Performance Tasks | 50% |
| Quarterly Assessment | 20% |

```python
COMPONENTS = {"written_work": 0.30, "performance_tasks": 0.50, "quarterly": 0.20}

def quarterly_grade(scores):
    return sum(scores[k] * w for k, w in COMPONENTS.items())
```

## Transmutation

The raw weighted grade maps to the transmutation table before it reaches a report card. Encoding that mapping in one function makes a policy change a one-line edit, not a hunt through spreadsheets — and it makes the result reproducible, so the same inputs always produce the same printed grade.

## Seven roles, one source of truth

Super Admin, Admin, Principal, Teacher, Student, Parent and Registrar all read the same tables through role-scoped views. A teacher enters grades; the registrar regenerates SF9 and SF10 from those same rows. There is no second copy of a grade to fall out of sync, because there is only one. A parent viewing a child's card and a principal approving a correction touch the identical data through different lenses, and the Super Admin monitoring panel watches error logs and system health across all of it.

## What this bought the school

Before, a single grade change meant updating a spreadsheet, re-deriving the average, and reprinting a card — three chances to drift. Now a correction flows from the teacher's entry straight to the regenerated report card. The engineering did not make grading smarter; it made the policy explicit and the source singular, which is usually what school systems actually need.
""",
        "project_slug": "jnhs-portal",
        "level": "advanced",
        "tags": ["postgresql", "education"],
    },
    {
        "title": "Real-time dashboards with Socket.IO and role-scoped panels",
        "excerpt": "How Farm Connect pushes live application status to four municipal panels without a single manual refresh.",
        "content_md": """## Dashboards that lie

A dashboard that needs a manual refresh to be correct is a report, not a dashboard. Farm Connect's municipal agriculture office wanted live status on RSBSA applications, so an encoder submitting a form and a supervisor watching the board had to agree on the truth without anyone hitting reload.

## Socket.IO on Flask

I paired Flask with Socket.IO so status changes push to every relevant open panel the moment they happen:

```python
@socketio.on("connect")
def on_connect():
    join_room(f"muni:{current_user.municipality}")

def notify_status(app_id, status):
    emit("application_update", {"id": app_id, "status": status},
         room=f"muni:{current_user.municipality}")
```

## Four panels, four jobs

Encoder, Verifier, MAO and Admin each get a scoped panel. An encoder submits, a verifier checks, the MAO approves, and the admin audits. Each role sees only its own stage, so the socket rooms double as an authorization boundary — a verifier's browser never receives an admin-only event, because it never joins that room. Scoping the rooms by role and municipality means the live layer enforces the same boundaries as the REST endpoints, instead of trusting the client to hide what it should not see.

## Disconnects are normal

Municipal connections are not always stable, so the client reconnects and re-fetches authoritative state on the way back in rather than trusting whatever it last buffered. The socket layer is an accelerator for freshness, never the source of truth — if the socket is silent, a plain GET still returns the correct current status. That separation is what keeps a live dashboard honest when the network is not.

## Reports on demand

Because the data is already normalized, government PDFs generate straight from form data instead of being retyped into a template. The document and the database cannot disagree, because there is only one of them.
""",
        "project_slug": "farm-connect",
        "level": "advanced",
        "tags": ["flask", "realtime"],
    },
    {
        "title": "Designing a campus order lifecycle that staff actually follows",
        "excerpt": "The LSPU-BAO portal in three states — browse, request, track — designed for users who touch it twice a year.",
        "content_md": """## The real requirement

LSPU-BAO's supplies office served students and faculty through walk-in requests. Availability lived in a logbook, so people queued without knowing whether their items were ready. The fix was not a bigger form — it was making state visible, so nobody had to ask a person to learn what a system already knew.

## Three steps, no manual

The whole public flow is browse, request, track. A small state machine keeps every order honest:

```python
class OrderStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    ready = "ready"
    released = "released"
```

A student picks from the catalog, submits a request, and returns to a status page that reads from the same row staff update. No phone call, no logbook, no "come back tomorrow to check."

## Staff side, in one transaction

The fulfillment panel moves an order through those states and edits inventory in the same transaction, so a released order decrements stock exactly once:

```python
with db.begin():
    order = lock(order_id)
    order.status = OrderStatus.released
    decrement_stock(order.item_id, order.qty)
```

Locking the row and updating stock atomically means concurrent releases cannot oversell a constrained item — over-selling becomes a database constraint rather than a staff memory, which is exactly where it belongs.

## Designing for first-time users

Most people touch this portal a few times a year, usually under time pressure. That drove every choice: one column of content, plain status words instead of internal codes, and the current state shown before any history. When a system is used rarely, it has to explain itself on first contact — the goal was not a clever interface, but one nobody needed training to use.
""",
        "project_slug": "lspu-bao-portal",
        "level": "intermediate",
        "tags": ["ux", "product"],
    },
    {
        "title": "Adding an AI helper to a courseware platform",
        "excerpt": "Grounding an AI assistant in a platform's own resources so answers stay honest, cited and useful.",
        "content_md": """## The gap

Enlighten ED had course materials and per-student skill tracking, but students still asked the same homework questions in chat, and an instructor answered the same thing fifty times a week. The AI helper closes that gap without replacing the courseware — it sits beside the material and points students at it.

## Retrieval before generation

The helper answers from the platform's own resources rather than free-form guessing. A query is matched against indexed materials, and only the relevant context reaches the model:

```python
context = index.search(query, k=5)
answer = llm.complete(system=GUARDRAILS, context=context, question=query)
```

That grounding is what keeps answers tied to the actual course instead of a plausible-sounding tangent. Without it, a language model will happily invent a definition that sounds right and is not in any assigned reading.

## Guardrails

The system prompt restricts the helper to course scope and asks it to cite the resource it used, so a student can verify the answer against the source. When nothing relevant is found, it says so and points to the material list — an honest "I don't have that" beats a confident wrong answer. Refusing is a feature: a helper that hallucinated a due date would cost more trust than it ever earned.

## Skill tracking, not just Q&A

Every interaction is logged against the student's skill record, so a pattern of questions on one topic surfaces as a skill gap the instructor can address. The helper is not a novelty chat box; it is another signal feeding the progress view, and it turns repeated confusion into data a teacher can act on.
""",
        "project_slug": "enlighten-ed",
        "level": "intermediate",
        "tags": ["ai", "education"],
    },
    {
        "title": "What an award-winning bootcamp capstone taught me about backend craft",
        "excerpt": "Notes from the Zuitt capstone that took the 2024 Star Award — and why structure, not cleverness, won it.",
        "content_md": """## The brief

Zuitt's bootcamp capstone required a Python backend wired to MySQL behind a responsive interface, on a tight timeline. I served as backend developer, and the project took the Star Web Development & UX/UI Design Award in 2024. What follows is the part worth repeating: the award rewarded structure, not cleverness.

## What the judges actually rewarded

The win came from boring, deliberate choices that made the codebase easy to read and hard to break:

- A thin route layer over explicit service functions, so handlers stayed short and the logic had one home.
- One data-access module instead of SQL scattered through handlers, so a query fix landed in one place.
- Consistent error shapes, so the frontend handled failure in a single path instead of parsing five different error formats.

None of that is glamorous. All of it is what "clean implementation" meant when someone else read my code under a deadline.

## Keeping a fast timeline honest

On a bootcamp deadline the temptation is to inline everything and fix it later. I did the opposite where it counted: migrations from day one, and a schema that matched the domain. That paid off when the frontend grew — the backend never had to be rewritten, because the data model was already right. Speed and structure are not opposites; a clean schema is what let me move fast without accumulating a rewrite tax.

## The takeaway

A small project is the cheapest place to build good habits. The same discipline — clear boundaries, one source of truth, honest errors — scales to the larger systems I build now, from municipal portals to a two-branch arcade platform. The award was for a capstone, but the lesson was for everything after it.
""",
        "project_slug": "zuitt-codecamp-web-app",
        "level": "intermediate",
        "tags": ["python", "mysql"],
    },
    {
        "title": "Giving every student one stable key: LRN-based records",
        "excerpt": "Why the JNHS Portal's student table keys on the LRN instead of a name or a row number.",
        "content_md": """## The first mistake in a school schema

Every school database starts the same way: a `students` table with a name column, and code that finds a learner with `WHERE name = ?`. It works in a demo and breaks the first day two students share a name — in a school of hundreds that is not a question of if, but when.

## The LRN is already the key

DepEd issues every learner a Learner Reference Number: a stable, school-independent identifier the portal can lean on.

```sql
CREATE TABLE students (
    id   bigserial PRIMARY KEY,
    lrn  varchar(15) UNIQUE NOT NULL,
    ...
);
```

`id` stays as the internal join key — boring, reliable, never shown to users — while `lrn` is the unique business key that enrollment, grades and report cards hang off. A duplicate registration then collides on `UNIQUE` instead of quietly creating a second record for the same child.

## What it unlocked

Because enrollment, attendance and quarterly grades all reference one student row, SF9 and SF10 generate from the same record the teacher grades into. There is no reconciliation step, because there is nothing to reconcile.

## The lesson

Find the identifier your domain already hands you and put a `UNIQUE` constraint on it before the first duplicate arrives. Retrofitting that constraint later means deduplicating real records — someone's job, someone's mistake.
""",
        "project_slug": "jnhs-portal",
        "level": "beginner",
        "tags": ["postgresql", "education"],
    },
    {
        "title": "Designing daily attendance that survives a school day",
        "excerpt": "Half-days, re-marks and bulk entry — the ledger shape that keeps the JNHS attendance records honest.",
        "content_md": """## Attendance is a ledger, not a flag

The first instinct is a boolean per student: `present = true`. It holds up until second period, when a student marked present is later marked absent — the column keeps only the last answer and the morning disappears. The JNHS Portal treats attendance as one row per student per day:

```sql
CREATE TABLE attendance (
    student_id  bigint REFERENCES students(id),
    school_date date NOT NULL,
    status      varchar(8) NOT NULL,  -- present / absent / late
    recorded_by bigint REFERENCES users(id),
    PRIMARY KEY (student_id, school_date)
);
```

## One row per day, on purpose

The composite primary key makes a second entry for the same student and date impossible — a double-click or a laggy connection becomes a constraint violation instead of a corrupted history. Re-marking a student is an `UPDATE` of exactly one row, so "latest value" is unambiguous, and `recorded_by` keeps the trail of who wrote it.

## Bulk entry for teachers

Teachers mark a whole section — often forty learners — from one screen, so the write path batches the saves and lets the primary key absorb duplicates rather than failing the whole submission. The roster comes from section-based enrollment, so the list on screen is already scoped to that teacher's class; marking another section's students is not a misclick waiting to happen.

## Why it mattered

Daily attendance feeds the school's records and, downstream, the quarterly report cards. A ledger keyed on (student, date) is boring in the best way: it is impossible to store an attendance history that contradicts itself.
""",
        "project_slug": "jnhs-portal",
        "level": "intermediate",
        "tags": ["postgresql", "education"],
    },
    {
        "title": "From paper RSBSA forms to a first database design",
        "excerpt": "The first tables behind Farm Connect — turning the municipal RSBSA form into rows without losing what the paper already knew.",
        "content_md": """## Start with the form

Farm Connect replaced paper RSBSA registration for the municipal agriculture office. The fastest route to a correct first schema was to model the form itself before designing anything clever: every field an encoder fills in becomes a column, and every signature block becomes a relationship.

## The two entities that matter

Nearly everything on an RSBSA form belongs to either a farmer or an application:

```sql
CREATE TABLE farmers (
    id        bigserial PRIMARY KEY,
    rsbsa_no  varchar(20) UNIQUE,
    ...
);

CREATE TABLE applications (
    id         bigserial PRIMARY KEY,
    farmer_id  bigint NOT NULL REFERENCES farmers(id),
    status     varchar(16) NOT NULL DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT now()
);
```

`rsbsa_no UNIQUE` mirrors what the paper form already guaranteed — one registration per farmer — so the database rejects a duplicate exactly the way a careful encoder would.

## Status is a column, not a folder

On paper, an application's state was its physical location: inbox, pending, approved. In the database it is a `status` column on the row, which is what later makes dashboards, filters and PDF reports a query instead of a search.

## What I deliberately left out

No approval history, no wizard, no geo-encoding — the first version recorded what the paper recorded, correctly. Every feature added after stood on tables that already existed and already made sense. Starting boring is what let the interesting parts arrive later without a rebuild.
""",
        "project_slug": "farm-connect",
        "level": "beginner",
        "tags": ["postgresql", "government"],
    },
    {
        "title": "Four panels, one permission model: role-based access in Flask",
        "excerpt": "Encoder, Verifier, MAO and Admin share one Flask app — how Farm Connect keeps their permissions from bleeding together.",
        "content_md": """## One app, four jobs

Farm Connect serves four dedicated panels — Encoder, Verifier, MAO and Admin — from a single Flask application. The tempting shape is four copies of every route with a role check sprinkled inside each view. The cleaner shape is one gate in front and a decorator that declares who may enter:

```python
def role_required(*roles):
    def decorator(view):
        @functools.wraps(view)
        def wrapper(*args, **kwargs):
            if current_user.role not in roles:
                abort(403)
            return view(*args, **kwargs)
        return wrapper
    return decorator

@app.get("/verifier/applications")
@role_required("verifier")
def verifier_queue():
    ...
```

## Permissions you can read

Each route declares its roles in the decorator, and the check runs before the view does any work. Adding a fifth panel later means adding decorators — not auditing every inline `if` scattered through handlers — and a route with no decorator is obvious in review.

## The rest of the envelope

Role routing is only the outer layer. Farm Connect pairs it with CSRF protection on state-changing forms and encrypted authentication, so a forged cross-site post with no session dies at the door alongside a logged-in user with the wrong role.

## The rule I kept

A verifier's panel never renders data only the MAO should act on. Hiding a button is not authorization: the route itself refuses, and the templates only ever render what the gate already let through.
""",
        "project_slug": "farm-connect",
        "level": "intermediate",
        "tags": ["flask", "security"],
    },
    {
        "title": "Starting a courseware schema: materials, students, skills",
        "excerpt": "The first draft of Enlighten ED's data model — three tables that keep course materials, enrollment and skill records honest.",
        "content_md": """## Three nouns, three tables

Enlighten ED is a courseware platform with per-student skill tracking. The first schema draft simply named the nouns in that sentence and gave each a table before any feature existed — courses, materials, students — with the relationship between them made explicit:

```sql
CREATE TABLE materials (
    id        bigserial PRIMARY KEY,
    course_id bigint NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title     text NOT NULL,
    ...
);

CREATE TABLE enrollments (
    student_id bigint REFERENCES students(id),
    course_id  bigint REFERENCES courses(id),
    PRIMARY KEY (student_id, course_id)
);
```

## The junction table is the design

`enrollments` is where first drafts go wrong: students and courses are many-to-many, and any schema that puts `course_id` straight on the student row can only ever hold one course per learner. The composite key makes the relationship a fact in the database, and "is this student enrolled?" becomes a primary-key lookup.

## References do the housekeeping

`ON DELETE CASCADE` on materials means removing a course does not strand orphaned files, while foreign keys on students protect the rows that grades and skill records already point at. The constraints encode the school's rules once, in the layer that never forgets and never has a bad day.

## Why this was enough

Materials, enrollment and skill records covered the prototype's entire workflow. A schema that names the domain's nouns honestly turned the AI helper and the progress views into additions on top — not excavations through a model that never fit.
""",
        "project_slug": "enlighten-ed",
        "level": "beginner",
        "tags": ["postgresql", "education"],
    },
    {
        "title": "Designing student records that keep personal data separate",
        "excerpt": "How Enlighten ED's careful data model separates identity from performance so a progress query never drags personal data along.",
        "content_md": """## The risk in a student database

A courseware system holds two very different kinds of data: who a student is — names, contact details, account identifiers — and what they have done: grades, skill records, logged interactions. Query the second kind for analytics and it is remarkably easy to drag the first kind along with it.

## Split identity from performance

The design keeps personal fields on the student record and everything academic pointing at it by id:

```sql
CREATE TABLE student_profiles (
    student_id bigint PRIMARY KEY REFERENCES students(id),
    full_name  text NOT NULL,
    ...
);

CREATE TABLE skill_records (
    id         bigserial PRIMARY KEY,
    student_id bigint NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
    skill      text NOT NULL,
    level      smallint NOT NULL CHECK (level BETWEEN 0 AND 100)
);
```

A progress report selects from `skill_records` — names never enter the result set unless the view is specifically about a person.

## Integrity beats convention

`ON DELETE RESTRICT` means a student with academic history cannot be erased by accident; cleaning up personal details is a deliberate act on the profile row, not a cascade that quietly removes records the school still needs. The `CHECK` keeps skill levels honest at write time rather than at report time, when a wrong number has already been shown to someone.

## The payoff

The prototype's privacy story is not a layer of application checks — it is the shape of the tables. When identity and performance live in separate tables joined by a deliberate foreign key, the careless query has to go out of its way to leak, and the careful one is simply the default.
""",
        "project_slug": "enlighten-ed",
        "level": "advanced",
        "tags": ["postgresql", "education"],
    },
    {
        "title": "Talking to MySQL from Python: cursors, connections and safe queries",
        "excerpt": "The capstone's data-layer basics — a connection that always closes, and parameterized queries everywhere.",
        "content_md": """## Where the capstone started

Zuitt's capstone asked for a Python backend wired to MySQL behind a responsive interface, on a bootcamp clock. My part was the data layer, and its first working version taught the two lessons I still apply everywhere: a connection that is impossible to leak, and queries that never touch string concatenation.

## A cursor that always closes

The naive version opens a connection per request and forgets to close anything when an exception fires — until the pool empties in a demo. The context manager makes the mistake unrepresentable:

```python
with connection.cursor() as cur:
    cur.execute(
        "SELECT id, title FROM products WHERE category = %s",
        (category,),
    )
    rows = cur.fetchall()
```

## Parameters, not f-strings

The `%s` placeholder is the whole security story at this layer. Interpolating user input into SQL to save a line hands the database to anyone who can type a quote mark; parameterized queries let the driver handle escaping, so the statement stays a statement and the data stays data.

## Compound interest on habits

Neither line is clever. Both are the kind of reflex that has to exist by the time a codebase is judged on implementation craft — which, in a capstone graded exactly on that, it had to be.
""",
        "project_slug": "zuitt-codecamp-web-app",
        "level": "beginner",
        "tags": ["python", "mysql"],
    },
    {
        "title": "One data-access module: the pattern behind a clean capstone",
        "excerpt": "Why every query in the Zuitt capstone lived in one module — and what that bought the judges reading the code.",
        "content_md": """## The shape that won the read

The Zuitt capstone took the 2024 Star Web Development & UX/UI Design Award, and the judges were reading code quality, not screenshots. The structural choice that carried the most weight was the boring one: every SQL statement lived in a single data-access module, and routes never touched a cursor directly.

## What the module looks like

One file, explicit functions, one responsibility each:

```python
def get_order(order_id: int) -> Order | None:
    with connection.cursor() as cur:
        cur.execute("SELECT * FROM orders WHERE id = %s", (order_id,))
        row = cur.fetchone()
    return Order.from_row(row) if row else None
```

Routes call `get_order(...)`. They do not know the table name, the column list, or the driver's fetch semantics — that is the module's business, and only its business.

## Why it kept winning

- **A query fix lands in one place.** When something needed tuning, there was exactly one call site to find.
- **Rows become domain objects at one boundary.** `Order.from_row` is the only spot that knows cursors return tuples, so the rest of the app reads like the domain.
- **Errors normalize once.** Not-found and connection failures translate to consistent results at the module edge, instead of every handler inventing its own error shape — which the frontend then had to parse in one place anyway.

## The general lesson

This is the pattern I still start from on larger systems. The route layer stays thin, the data layer stays honest, and the distance between them is a function signature — exactly the distance a reviewer needs to judge an implementation in one pass.
""",
        "project_slug": "zuitt-codecamp-web-app",
        "level": "advanced",
        "tags": ["python", "architecture"],
    },
    {
        "title": "Types from the API to the component: strict TypeScript on the client",
        "excerpt": "How this portfolio's strict TypeScript turns an API contract into compile-time feedback instead of 2 a.m. runtime surprises.",
        "content_md": """## The failure mode strict mode removes

A React app without types fails late: `post.tags.map is not a function`, because the response was never what the component assumed. This portfolio runs TypeScript in strict mode, so that class of bug becomes a red squiggle at save time instead of a stack trace in production.

## One interface, stated once

The API contract lives in a single file and every layer reads from it:

```ts
export interface Post {
  id: number
  slug: string
  title: string
  excerpt: string
  content_md: string
  tags: string[]
  project_slug: string | null
  level: string | null
  status: string
  published_at: string | null
  created_at: string
}
```

Components import `Post`; they never restate its shape. When the backend gained `project_slug` and `level` for the writing archive, exactly one interface changed and the compiler listed every place that assumed otherwise.

## The rule that makes it hold

Nothing crosses the API boundary as `any`. The fetch wrapper returns typed results, so a 404 or a network error is handled before a component ever sees it. Strict mode is only as strong as its weakest escape hatch, and this codebase keeps the hatches locked.

## The payoff

Refactors become mechanical: rename a field, run the build, fix the lines the compiler lists. It is not thrilling — it is the absence of a whole category of bug, every day.
""",
        "project_slug": "rjvt-portfolio-platform",
        "level": "beginner",
        "tags": ["react", "typescript"],
    },
    {
        "title": "Visitor voting that the database refuses to duplicate",
        "excerpt": "Anonymous per-visitor ratings on this portfolio — the read-check-write path, and the unique constraint standing behind it.",
        "content_md": """## The requirement

This portfolio lets visitors rate projects without signing in. Anonymous voting sounds trivial until one visitor clicks twice — or fires the endpoint from a script — and the average drifts toward whoever refreshes hardest.

## The write path

The endpoint keeps exactly one vote per (project, visitor):

```python
existing = (
    await db.execute(
        select(ProjectVote).where(
            ProjectVote.project_id == project_id,
            ProjectVote.visitor_id == body.visitor_id,
        )
    )
).scalar_one_or_none()

if existing is None:
    db.add(ProjectVote(project_id=project_id,
                       visitor_id=body.visitor_id, value=body.value))
else:
    existing.value = body.value
```

A first vote inserts; any later click updates the value. The average reflects visitors, not clicks.

## The constraint behind the check

The check gives correct behavior; the guarantee behind it lives in the schema:

```python
__table_args__ = (
    UniqueConstraint("project_id", "visitor_id", name="uq_project_visitor"),
)
```

Two racing requests can both pass the check, but only one insert can commit — the loser gets an integrity error instead of a second row. Behavior in the service, correctness in the database: each layer owns what it is best at.

## Why both layers

Without the check, laggy visitors see errors they did nothing wrong to cause. Without the constraint, a race quietly corrupts the average. Having neither is how a five-star portfolio ends up reporting 5.7.
""",
        "project_slug": "rjvt-portfolio-platform",
        "level": "intermediate",
        "tags": ["postgresql", "fastapi"],
    },
    {
        "title": "Rate-limiting the public API without breaking the demo",
        "excerpt": "The small fixed-window helper guarding this portfolio's public endpoints — where it sits, why it is per-route, and its honest limits.",
        "content_md": """## The endpoints that need a bouncer

Contact forms and testimonial submissions are public writes: useful for visitors, attractive to bots. This portfolio guards them with a small per-route helper rather than a global middleware:

```python
def rate_limit(request, bucket, limit, window_seconds=3600):
    ip = request.client.host if request.client else "unknown"
    now = time.monotonic()
    cutoff = now - window_seconds
    hits = _hits[bucket][ip]
    hits[:] = [t for t in hits if t > cutoff]
    if len(hits) >= limit:
        raise HTTPException(429, "Too many requests")
    hits.append(now)
```

## Reading the helper

It is a fixed-window counter held in memory: timestamps per (bucket, IP), pruned to the window on every call, compared before appending. `time.monotonic()` keeps it immune to clock adjustments, and the 429 answers before the route does any work — no database write, no email send, no thumbnail processed.

## Why per-route instead of global

A global limit punishes browsing because of one noisy form. Declaring the budget at the call site —

```python
rate_limit(request, "messages", settings.RATE_LIMIT_MESSAGES_PER_HOUR)
```

— makes each endpoint's policy readable exactly where it is enforced, and leaves read-heavy routes untouched.

## The honest limits

State lives in the process, so the window resets on restart and does not transfer across workers. That is correct for this deployment and a reason to move to a shared store the day it scales out. Rate limiting is the rare feature where knowing precisely how your solution fails is part of knowing that it works.
""",
        "project_slug": "rjvt-portfolio-platform",
        "level": "advanced",
        "tags": ["fastapi", "security"],
    },
    {
        "title": "Catalog first: the simplest useful slice of a portal",
        "excerpt": "Why the LSPU-BAO portal started as a read-only catalog — and what leaving features out taught me about scope.",
        "content_md": """## The hardest part of a portal is what you leave out

LSPU-BAO's supplies office needed a portal, and the obvious version wanted everything at once: accounts, carts, approvals, notifications. The version that shipped started smaller — a catalog students and faculty could actually browse.

## Slice one: read-only rows

The first slice was a product list rendered straight from the database:

```python
@app.get("/catalog")
def catalog(db: Session = Depends(get_db)):
    items = db.execute(
        select(Product)
        .where(Product.is_available)
        .order_by(Product.name)
    ).scalars().all()
    return render("catalog.html", items=items)
```

No session, no write path — just honest data on a screen. It put the real questions in front of the office immediately: what counts as available, which fields students actually look for, and how stock is phrased so nobody requests an empty shelf.

## What the slice proved

Once the catalog was right, order placement had a list worth ordering from and a stock number worth respecting. Every later state — pending, approved, ready, released — hangs off rows that already existed and already made sense to the people using them.

## The lesson

A read-only screen is the cheapest possible conversation with a user. Shipping it first turns scope debates into reactions to something real, and it is the cut I still recommend for any internal portal.
""",
        "project_slug": "lspu-bao-portal",
        "level": "beginner",
        "tags": ["ux", "product"],
    },
    {
        "title": "Two trust levels, one service: public portal vs staff panel",
        "excerpt": "How the LSPU-BAO portal keeps public browsing and staff fulfillment behind one Python service with two explicit trust levels.",
        "content_md": """## One service, two audiences

The LSPU-BAO portal has a public side — students and faculty browsing a catalog and tracking their own requests — and a staff side that edits inventory and releases orders. Both live in one Python service, which makes the boundary between them a design decision rather than a deployment detail.

## The public surface assumes nothing

Public routes expose only what a stranger may see: catalog rows, and the status of a request scoped to the person who made it. There is no "list every order" endpoint for the front end to accidentally call, and no public route that can move stock — releasing an order is structurally impossible from this side, not merely hidden behind an unclicked button.

```python
@app.get("/orders/{order_id}")
def order_status(order_id: int, viewer: Viewer = Depends(current_viewer)):
    order = get_order(order_id)
    if order is None or not viewer.may_view(order):
        raise HTTPException(404)   # missing and forbidden look identical
```

The 404-forbidden trick matters: an attacker probing ids learns nothing about which orders exist.

## The staff surface requires identity

Fulfillment routes gate on an authenticated staff session and the role behind the panel, then run the transaction that changes state and stock together. The service function that releases an order is never reachable without that gate — the same code, a different door.

## Why the split is worth stating

Portals like this fail in one of two directions: everything public "for convenience," or staff routes mirrored one-to-one onto public ones with checks sprinkled inside. Naming the two trust levels first makes every new route answer one question before it is written — which side is this on, and what does that side assume about its caller?
""",
        "project_slug": "lspu-bao-portal",
        "level": "advanced",
        "tags": ["python", "security"],
    },
    {
        "title": "From attendance sheets to payslips: the payroll data model",
        "excerpt": "The first tables behind Dreamland Arcade — turning daily attendance into payslips a branch owner can still re-check months later.",
        "content_md": """## Paper in, paper out

Before dashboards and POS analytics, Dreamland Arcade's payroll was attendance sheets and a calculator. The first useful build simply made that pipeline queryable: hours in, pay out, with every step stored — because a payslip questioned three months later has to explain itself.

## Three tables, one direction

```sql
CREATE TABLE attendance (
    id          bigserial PRIMARY KEY,
    employee_id bigint NOT NULL REFERENCES employees(id),
    shift_date  date NOT NULL,
    hours       numeric(4,2) NOT NULL CHECK (hours >= 0),
    branch_id   int NOT NULL
);

CREATE TABLE payslips (
    id           bigserial PRIMARY KEY,
    employee_id  bigint NOT NULL REFERENCES employees(id),
    period_start date NOT NULL,
    period_end   date NOT NULL,
    gross        numeric(12,2) NOT NULL,
    branch_id    int NOT NULL
);
```

Attendance rows are facts about a shift; a payslip is an immutable snapshot of a period. Neither is recomputed when displayed — the number on the slip is the number that was paid, forever the same.

## The CHECK that pays for itself

`CHECK (hours >= 0)` catches the fat-fingered 80-hour entry at write time, when it is a form error, instead of at payout, when it is an awkward conversation with an employee. The same instinct later became the auto-reshuffle scheduler's maximum-hours rule: constraints encode the rules nobody should have to remember.

## Why this was the right first build

Branch column on every row from day one, exact decimals instead of floating point for money, and no clever derivation logic. The layers that came after — row-level isolation, the reshuffle scheduler, POS revenue analytics — all stand on tables that were already trustworthy.
""",
        "project_slug": "dreamland-arcade-management-system",
        "level": "beginner",
        "tags": ["postgresql", "python"],
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

        # Backfill metric cards on projects already in the database, so stat
        # lists added to PROJECTS later reach live rows (idempotent — writes
        # only when the stored list differs).
        results_by_slug = {_slugify(p["title"]): p["results"] for p in PROJECTS}
        rows = (await db.execute(select(Project).where(Project.slug.in_(results_by_slug)))).scalars().all()
        backfilled = 0
        for project in rows:
            want = results_by_slug[project.slug]
            if project.results != want:
                project.results = want
                backfilled += 1
        if backfilled:
            print(f"[seed] backfilled results on {backfilled} projects")

        # Attach demo videos to their corresponding works (idempotent — runs every
        # seed so already-inserted projects receive their videos as well).
        video_by_slug = {
            "lspu-bao-portal": "/media/videos/work1.mp4",  # LSPU-BAO portal walkthrough
            "zuitt-codecamp-web-app": "/media/videos/work2.mp4",  # capstone showcase
            "jnhs-portal": "/media/videos/work3.mp4",  # user-friendly navigation
            "dreamland-arcade-management-system": "/media/videos/work5.mp4",  # python back-end
            "farm-connect": "/media/videos/work6.mp4",  # web & mobile UI
        }
        rows = (await db.execute(select(Project).where(Project.slug.in_(video_by_slug)))).scalars().all()
        attached = 0
        for project in rows:
            want = video_by_slug[project.slug]
            if project.demo_video != want:
                project.demo_video = want
                attached += 1
        if attached:
            print(f"[seed] attached demo videos to {attached} projects")

        # Posts: insert any that are missing (by slug) and backfill the
        # project/level metadata on rows already in the database — a seed run
        # never overwrites content that is already published.
        existing_posts = {
            p.slug: p for p in (await db.execute(select(Post))).scalars().all()
        }
        inserted_p = updated_p = 0
        for raw in POSTS:
            slug = _slugify(raw["title"])
            post = existing_posts.get(slug)
            if post is None:
                db.add(
                    Post(
                        slug=slug,
                        title=raw["title"],
                        excerpt=raw["excerpt"],
                        content_md=raw["content_md"],
                        tags=raw["tags"],
                        project_slug=raw.get("project_slug"),
                        level=raw.get("level"),
                        status="published",
                        published_at=datetime.now(timezone.utc),
                    )
                )
                inserted_p += 1
                continue
            if "project_slug" in raw and post.project_slug != raw["project_slug"]:
                post.project_slug = raw["project_slug"]
                updated_p += 1
            if "level" in raw and post.level != raw["level"]:
                post.level = raw["level"]
                updated_p += 1
        if inserted_p or updated_p:
            print(
                f"[seed] inserted {inserted_p} new posts, "
                f"backfilled metadata on {updated_p} "
                f"({len(existing_posts) + inserted_p} total)"
            )

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
