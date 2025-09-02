from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from enum import Enum

from app.models import (
    UserRole, EnrollmentStatus, OrderStatus, 
    PaymentStatus, PaymentProvider, SFUProvider
)


# Base Schemas
class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class TimestampSchema(BaseSchema):
    created_at: datetime
    updated_at: datetime


# User Schemas
class UserBase(BaseSchema):
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=120)
    role: UserRole = UserRole.STUDENT
    phone: Optional[str] = Field(None, pattern=r"^\+?[1-9]\d{9,14}$")
    bio: Optional[str] = None


class UserCreate(UserBase):
    picture_url: Optional[str] = None


class UserUpdate(BaseSchema):
    name: Optional[str] = Field(None, min_length=1, max_length=120)
    phone: Optional[str] = Field(None, pattern=r"^\+?[1-9]\d{9,14}$")
    bio: Optional[str] = None
    picture_url: Optional[str] = None


class UserInDB(UserBase):
    id: int
    picture_url: Optional[str] = None
    is_active: bool
    is_verified: bool


class UserPublic(BaseSchema):
    id: int
    name: str
    picture_url: Optional[str] = None
    role: UserRole


class UserProfile(UserInDB):
    enrollments_count: int = 0
    courses_owned_count: int = 0


# OAuth Schemas
class OAuthAccountCreate(BaseSchema):
    provider: str
    provider_user_id: str
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = None


# Course Schemas
class CourseBase(BaseSchema):
    title: str = Field(..., min_length=1, max_length=200)
    summary: str = Field(..., min_length=1)
    description: Optional[str] = None
    price_inr: int = Field(..., ge=0)
    thumbnail_url: Optional[str] = None
    preview_video_url: Optional[str] = None
    duration_hours: Optional[float] = Field(None, ge=0)
    difficulty_level: Optional[str] = Field(None, pattern="^(beginner|intermediate|advanced)$")
    tags: Optional[List[str]] = None


class CourseCreate(CourseBase):
    slug: str = Field(..., min_length=1, max_length=200, pattern="^[a-z0-9-]+$")


class CourseUpdate(BaseSchema):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    summary: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    price_inr: Optional[int] = Field(None, ge=0)
    thumbnail_url: Optional[str] = None
    preview_video_url: Optional[str] = None
    duration_hours: Optional[float] = Field(None, ge=0)
    difficulty_level: Optional[str] = Field(None, pattern="^(beginner|intermediate|advanced)$")
    tags: Optional[List[str]] = None
    is_published: Optional[bool] = None
    is_featured: Optional[bool] = None


class CourseInDB(CourseBase, TimestampSchema):
    id: int
    slug: str
    is_published: bool
    is_featured: bool
    owner_id: int
    owner: UserPublic


class CoursePublic(BaseSchema):
    id: int
    title: str
    slug: str
    summary: str
    price_inr: int
    thumbnail_url: Optional[str] = None
    duration_hours: Optional[float] = None
    difficulty_level: Optional[str] = None
    tags: Optional[List[str]] = None
    owner: UserPublic


class CourseDetail(CourseInDB):
    modules: List["ModuleWithLessons"] = []
    enrollments_count: int = 0


# Module Schemas
class ModuleBase(BaseSchema):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    order_index: int = Field(..., ge=0)


class ModuleCreate(ModuleBase):
    course_id: int


class ModuleUpdate(BaseSchema):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    order_index: Optional[int] = Field(None, ge=0)


class ModuleInDB(ModuleBase, TimestampSchema):
    id: int
    course_id: int


class ModuleWithLessons(ModuleInDB):
    lessons: List["LessonPublic"] = []


# Lesson Schemas
class LessonBase(BaseSchema):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    order_index: int = Field(..., ge=0)
    duration_sec: Optional[int] = Field(None, ge=0)
    free_preview: bool = False
    resources: Optional[List[Dict[str, Any]]] = None


class LessonCreate(LessonBase):
    module_id: int
    video_key: Optional[str] = None
    video_url: Optional[str] = None


class LessonUpdate(BaseSchema):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    order_index: Optional[int] = Field(None, ge=0)
    video_key: Optional[str] = None
    video_url: Optional[str] = None
    duration_sec: Optional[int] = Field(None, ge=0)
    free_preview: Optional[bool] = None
    resources: Optional[List[Dict[str, Any]]] = None


class LessonInDB(LessonBase, TimestampSchema):
    id: int
    module_id: int
    video_key: Optional[str] = None
    video_url: Optional[str] = None


class LessonPublic(BaseSchema):
    id: int
    title: str
    order_index: int
    duration_sec: Optional[int] = None
    free_preview: bool


class LessonDetail(LessonInDB):
    comments_count: int = 0


# Comment Schemas
class CommentBase(BaseSchema):
    body: str = Field(..., min_length=1)


class CommentCreate(CommentBase):
    lesson_id: int
    parent_id: Optional[int] = None


class CommentUpdate(BaseSchema):
    body: str = Field(..., min_length=1)


class CommentInDB(CommentBase, TimestampSchema):
    id: int
    user_id: int
    lesson_id: int
    parent_id: Optional[int] = None
    is_edited: bool
    is_deleted: bool
    user: UserPublic


class CommentWithReplies(CommentInDB):
    replies: List["CommentInDB"] = []


# Enrollment Schemas
class EnrollmentCreate(BaseSchema):
    course_id: int


class EnrollmentUpdate(BaseSchema):
    status: Optional[EnrollmentStatus] = None
    progress_percent: Optional[float] = Field(None, ge=0, le=100)
    completed_lessons: Optional[List[int]] = None


class EnrollmentInDB(TimestampSchema):
    id: int
    user_id: int
    course_id: int
    status: EnrollmentStatus
    progress_percent: float
    completed_lessons: Optional[List[int]] = None
    certificate_issued: bool
    certificate_url: Optional[str] = None
    expires_at: Optional[datetime] = None
    user: UserPublic
    course: CoursePublic


# Order Schemas
class OrderCreate(BaseSchema):
    course_id: int
    provider: PaymentProvider
    amount_inr: int = Field(..., gt=0)
    notes: Optional[Dict[str, Any]] = None


class OrderUpdate(BaseSchema):
    status: Optional[OrderStatus] = None
    provider_order_id: Optional[str] = None


class OrderInDB(TimestampSchema):
    id: int
    user_id: int
    course_id: int
    provider: PaymentProvider
    amount_inr: int
    status: OrderStatus
    provider_order_id: Optional[str] = None
    receipt_number: str
    notes: Optional[Dict[str, Any]] = None
    user: UserPublic
    course: CoursePublic


# Payment Schemas
class PaymentCreate(BaseSchema):
    order_id: int
    provider_payment_id: str
    amount_inr: int = Field(..., gt=0)
    method: Optional[str] = None
    meta_json: Optional[Dict[str, Any]] = None


class PaymentUpdate(BaseSchema):
    status: Optional[PaymentStatus] = None
    meta_json: Optional[Dict[str, Any]] = None


class PaymentInDB(TimestampSchema):
    id: int
    order_id: int
    provider_payment_id: str
    status: PaymentStatus
    amount_inr: int
    method: Optional[str] = None
    meta_json: Optional[Dict[str, Any]] = None


# Live Room Schemas
class LiveRoomBase(BaseSchema):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    start_ts: datetime
    end_ts: datetime
    max_participants: int = Field(100, ge=1, le=1000)
    
    @field_validator("end_ts")
    @classmethod
    def validate_end_time(cls, v, info):
        if "start_ts" in info.data and v <= info.data["start_ts"]:
            raise ValueError("end_ts must be after start_ts")
        return v


class LiveRoomCreate(LiveRoomBase):
    course_id: int
    sfu_provider: SFUProvider = SFUProvider.LIVEKIT


class LiveRoomUpdate(BaseSchema):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    start_ts: Optional[datetime] = None
    end_ts: Optional[datetime] = None
    is_active: Optional[bool] = None
    recording_url: Optional[str] = None


class LiveRoomInDB(LiveRoomBase, TimestampSchema):
    id: int
    course_id: int
    sfu_provider: SFUProvider
    room_name: str
    is_active: bool
    recording_url: Optional[str] = None
    course: CoursePublic


# Attendance Schemas
class AttendanceCreate(BaseSchema):
    room_id: int
    user_id: int


class AttendanceUpdate(BaseSchema):
    left_at: Optional[datetime] = None
    duration_sec: Optional[int] = Field(None, ge=0)


class AttendanceInDB(TimestampSchema):
    id: int
    room_id: int
    user_id: int
    joined_at: datetime
    left_at: Optional[datetime] = None
    duration_sec: Optional[int] = None
    user: UserPublic


# Audit Log Schemas
class AuditLogCreate(BaseSchema):
    action: str = Field(..., min_length=1, max_length=100)
    target: str = Field(..., min_length=1, max_length=100)
    target_id: Optional[int] = None
    meta: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class AuditLogInDB(BaseSchema):
    id: int
    actor_id: int
    action: str
    target: str
    target_id: Optional[int] = None
    meta: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime
    actor: UserPublic


# Token Schemas
class Token(BaseSchema):
    access_token: str
    token_type: str = "bearer"
    refresh_token: Optional[str] = None


class TokenData(BaseSchema):
    user_id: int
    email: str
    role: UserRole


# File Upload Schemas
class PresignedUploadURL(BaseSchema):
    upload_url: str
    key: str
    expires_in: int = 900


class FileUploadResponse(BaseSchema):
    file_key: str
    file_url: str
    content_type: str
    size_bytes: int


# Payment Webhook Schemas
class RazorpayWebhookEvent(BaseSchema):
    event: str
    payload: Dict[str, Any]


class PhonePeWebhookEvent(BaseSchema):
    success: bool
    code: str
    message: str
    data: Dict[str, Any]


# WebSocket Message Schemas
class WSMessage(BaseSchema):
    type: str
    data: Dict[str, Any]


class CommentWSMessage(WSMessage):
    type: str = "comment"
    data: CommentInDB


# Pagination Schemas
class PaginationParams(BaseSchema):
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)


class PaginatedResponse(BaseSchema):
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int


# Health Check Schema
class HealthCheck(BaseSchema):
    status: str = "healthy"
    timestamp: datetime
    version: str
    database: bool = False
    redis: bool = False


# Forward references resolution
ModuleWithLessons.model_rebuild()
CommentWithReplies.model_rebuild()