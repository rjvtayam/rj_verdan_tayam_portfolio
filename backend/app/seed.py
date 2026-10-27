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
        "tags": ["python", "mysql"],
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

        # Posts: insert any that are missing (by slug) so new write-ups ship
        # without touching posts already in the database.
        post_slugs = set((await db.execute(select(Post.slug))).scalars().all())
        inserted_p = 0
        for raw in POSTS:
            slug = _slugify(raw["title"])
            if slug in post_slugs:
                continue
            db.add(
                Post(
                    slug=slug,
                    title=raw["title"],
                    excerpt=raw["excerpt"],
                    content_md=raw["content_md"],
                    tags=raw["tags"],
                    status="published",
                    published_at=datetime.now(timezone.utc),
                )
            )
            post_slugs.add(slug)
            inserted_p += 1
        if inserted_p:
            print(f"[seed] inserted {inserted_p} new posts ({len(post_slugs)} total)")

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
