from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.db.database import get_db
from app.schemas import (
    CourseCreate, CourseUpdate, CoursePublic, CourseDetail,
    ModuleCreate, ModuleUpdate, ModuleWithLessons,
    LessonCreate, LessonUpdate, LessonDetail,
    PaginatedResponse, PaginationParams
)

router = APIRouter()


@router.get("/", response_model=PaginatedResponse)
async def list_courses(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    List all published courses with pagination
    """
    # TODO: Implement course listing with search and pagination
    return {
        "items": [],
        "total": 0,
        "page": page,
        "page_size": page_size,
        "total_pages": 0
    }


@router.post("/", response_model=CoursePublic)
async def create_course(
    course: CourseCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new course (instructor/admin only)
    """
    # TODO: Implement course creation with auth check
    return {"message": "Course creation - to be implemented"}


@router.get("/{course_id}", response_model=CourseDetail)
async def get_course(
    course_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get course details by ID
    """
    # TODO: Implement course retrieval
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Course not found"
    )


@router.put("/{course_id}", response_model=CoursePublic)
async def update_course(
    course_id: int,
    course_update: CourseUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update course (owner/admin only)
    """
    # TODO: Implement course update with auth check
    return {"message": "Course update - to be implemented"}


@router.delete("/{course_id}")
async def delete_course(
    course_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete course (owner/admin only)
    """
    # TODO: Implement course deletion with auth check
    return {"message": "Course deleted successfully"}


# Module endpoints
@router.post("/{course_id}/modules", response_model=ModuleWithLessons)
async def create_module(
    course_id: int,
    module: ModuleCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new module in a course
    """
    # TODO: Implement module creation
    return {"message": "Module creation - to be implemented"}


@router.put("/modules/{module_id}", response_model=ModuleWithLessons)
async def update_module(
    module_id: int,
    module_update: ModuleUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update module
    """
    # TODO: Implement module update
    return {"message": "Module update - to be implemented"}


# Lesson endpoints
@router.post("/modules/{module_id}/lessons", response_model=LessonDetail)
async def create_lesson(
    module_id: int,
    lesson: LessonCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new lesson in a module
    """
    # TODO: Implement lesson creation
    return {"message": "Lesson creation - to be implemented"}


@router.get("/lessons/{lesson_id}", response_model=LessonDetail)
async def get_lesson(
    lesson_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get lesson details
    """
    # TODO: Implement lesson retrieval
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Lesson not found"
    )