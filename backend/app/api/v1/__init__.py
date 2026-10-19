from fastapi import APIRouter

from app.api.v1 import admin, auth, catalog, messages, posts, projects, testimonials

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(posts.router, prefix="/posts", tags=["posts"])
api_router.include_router(catalog.router, tags=["skills", "experiences"])
api_router.include_router(messages.router, prefix="/messages", tags=["messages"])
api_router.include_router(testimonials.router, prefix="/testimonials", tags=["testimonials"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
