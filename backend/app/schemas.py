import math
import re
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

# ---------- auth ----------


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    role: str


# ---------- tags / projects ----------


class TagOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class ProjectBase(BaseModel):
    slug: str = Field(min_length=1, max_length=255)
    title: str = Field(min_length=1, max_length=255)
    summary: str = ""
    problem: str = ""
    approach: str = ""
    results: list[dict] = []
    tech_stack: list[str] = []
    repo_url: str | None = None
    demo_url: str | None = None
    demo_video: str | None = None
    cover_image: str | None = None
    featured: bool = False
    rating: int | None = Field(default=None, ge=1, le=5)
    status: str = "published"
    tags: list[str] = []


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    slug: str | None = None
    title: str | None = None
    summary: str | None = None
    problem: str | None = None
    approach: str | None = None
    results: list[dict] | None = None
    tech_stack: list[str] | None = None
    repo_url: str | None = None
    demo_url: str | None = None
    demo_video: str | None = None
    cover_image: str | None = None
    featured: bool | None = None
    rating: int | None = Field(default=None, ge=1, le=5)
    status: str | None = None
    tags: list[str] | None = None


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    title: str
    summary: str
    problem: str
    approach: str
    results: list[dict]
    tech_stack: list[str]
    repo_url: str | None
    demo_url: str | None
    demo_video: str | None
    cover_image: str | None
    featured: bool
    status: str
    created_at: datetime
    tags: list[TagOut] = []
    rating: int | None = None
    rating_avg: float = 0.0
    rating_count: int = 0


# ---------- posts ----------


class PostBase(BaseModel):
    slug: str = Field(min_length=1, max_length=255)
    title: str = Field(min_length=1, max_length=255)
    excerpt: str = ""
    content_md: str = ""
    tags: list[str] = []
    project_slug: str | None = Field(default=None, max_length=255)
    level: str | None = Field(default=None, max_length=16)
    status: str = "published"
    published_at: datetime | None = None


class PostCreate(PostBase):
    pass


class PostUpdate(BaseModel):
    slug: str | None = None
    title: str | None = None
    excerpt: str | None = None
    content_md: str | None = None
    tags: list[str] | None = None
    project_slug: str | None = None
    level: str | None = None
    status: str | None = None
    published_at: datetime | None = None


class PostOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    title: str
    excerpt: str
    content_md: str
    tags: list[str]
    project_slug: str | None = None
    level: str | None = None
    status: str
    published_at: datetime | None
    created_at: datetime


_CODE_FENCE = re.compile(r"```[\s\S]*?```")


def reading_minutes(content_md: str) -> int:
    """Reading time for a markdown body — must match frontend lib/format.ts.

    Prose reads at ~200 wpm; fenced code is counted per line (50 lines ≈
    1 min) so technical posts don't collapse to a single minute. Rounding is
    half-up to mirror JavaScript's Math.round (Python's round() is banker's).
    """
    if not content_md:
        return 1
    code_lines = [
        line
        for line in "\n".join(_CODE_FENCE.findall(content_md)).split("\n")
        if line.strip() and not line.strip().startswith("```")
    ]
    prose_words = len(_CODE_FENCE.sub(" ", content_md).split())
    minutes = prose_words / 200 + len(code_lines) / 50
    return max(1, math.floor(minutes + 0.5))


class PostListOut(BaseModel):
    """List-view post: everything except the (heavy) body, plus the reading
    time precomputed server-side so cards never need content_md."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    title: str
    excerpt: str
    tags: list[str]
    project_slug: str | None = None
    level: str | None = None
    status: str
    published_at: datetime | None
    created_at: datetime
    reading_minutes: int
    created_at: datetime


# ---------- skills / experiences ----------


class SkillBase(BaseModel):
    name: str
    category: str
    proficiency: int = Field(default=3, ge=1, le=5)
    icon: str | None = None
    order: int = 0


class SkillCreate(SkillBase):
    pass


class SkillUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    proficiency: int | None = Field(default=None, ge=1, le=5)
    icon: str | None = None
    order: int | None = None


class SkillOut(SkillBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class ExperienceBase(BaseModel):
    company: str
    role: str
    start_date: date
    end_date: date | None = None
    bullets: list[str] = []
    order: int = 0


class ExperienceCreate(ExperienceBase):
    pass


class ExperienceUpdate(BaseModel):
    company: str | None = None
    role: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    bullets: list[str] | None = None
    order: int | None = None


class ExperienceOut(ExperienceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


# ---------- messages ----------


class MessageCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    subject: str = Field(default="", max_length=255)
    body: str = Field(min_length=10, max_length=5000)


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    subject: str
    body: str
    is_read: bool
    created_at: datetime


class MessagePatch(BaseModel):
    is_read: bool


# ---------- votes ----------


class VoteRequest(BaseModel):
    value: int = Field(ge=1, le=5)
    visitor_id: str = Field(min_length=8, max_length=64, pattern=r"^[A-Za-z0-9\-]+$")


class VoteResult(BaseModel):
    rating_avg: float
    rating_count: int
    my_vote: int


# ---------- testimonials ----------


class TestimonialCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    role: str = Field(default="", max_length=200)
    quote: str = Field(min_length=10, max_length=2000)
    rating: int = Field(ge=1, le=5)


class TestimonialOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    role: str
    quote: str
    rating: int
    avatar_url: str | None
    status: str
    created_at: datetime


class TestimonialPatch(BaseModel):
    status: str = Field(pattern=r"^(published|pending)$")


# ---------- stats ----------


class AdminStats(BaseModel):
    projects: int
    published_projects: int
    posts: int
    unread_messages: int
    messages: int
    skills: int
    testimonials: int
