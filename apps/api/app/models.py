from datetime import datetime
from typing import Optional, List
from enum import Enum as PyEnum
from sqlalchemy import (
    Integer, String, Text, Boolean, Float, DateTime, ForeignKey, 
    JSON, Enum, UniqueConstraint, Index, CheckConstraint, func
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.ext.hybrid import hybrid_property


class Base(DeclarativeBase):
    pass


# Enums
class UserRole(str, PyEnum):
    STUDENT = "student"
    INSTRUCTOR = "instructor"
    ADMIN = "admin"


class EnrollmentStatus(str, PyEnum):
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    REFUNDED = "refunded"
    EXPIRED = "expired"


class OrderStatus(str, PyEnum):
    CREATED = "created"
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class PaymentStatus(str, PyEnum):
    PENDING = "pending"
    AUTHORIZED = "authorized"
    CAPTURED = "captured"
    FAILED = "failed"
    REFUNDED = "refunded"


class PaymentProvider(str, PyEnum):
    RAZORPAY = "razorpay"
    PHONEPE = "phonepe"
    STRIPE = "stripe"


class SFUProvider(str, PyEnum):
    LIVEKIT = "livekit"
    JITSI = "jitsi"
    CUSTOM = "custom"


# Base Mixin for common fields
class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now(), 
        nullable=False
    )


# User Model
class User(Base, TimestampMixin):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    picture_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole), 
        default=UserRole.STUDENT, 
        nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Relationships
    oauth_accounts: Mapped[List["OAuthAccount"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    owned_courses: Mapped[List["Course"]] = relationship(
        back_populates="owner", cascade="all, delete-orphan"
    )
    enrollments: Mapped[List["Enrollment"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    comments: Mapped[List["Comment"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    orders: Mapped[List["Order"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    attendance_records: Mapped[List["Attendance"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    audit_logs: Mapped[List["AuditLog"]] = relationship(
        back_populates="actor", cascade="all, delete-orphan"
    )
    
    __table_args__ = (
        Index("idx_user_email", "email"),
        Index("idx_user_role", "role"),
    )


# OAuth Account Model
class OAuthAccount(Base, TimestampMixin):
    __tablename__ = "oauth_accounts"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    provider_user_id: Mapped[str] = mapped_column(String(255), nullable=False)
    access_token: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    refresh_token: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="oauth_accounts")
    
    __table_args__ = (
        UniqueConstraint("provider", "provider_user_id", name="uq_provider_account"),
        Index("idx_oauth_user_id", "user_id"),
    )


# Course Model
class Course(Base, TimestampMixin):
    __tablename__ = "courses"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    price_inr: Mapped[int] = mapped_column(Integer, nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    preview_video_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    duration_hours: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    difficulty_level: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    tags: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    
    # Relationships
    owner: Mapped["User"] = relationship(back_populates="owned_courses")
    modules: Mapped[List["Module"]] = relationship(
        back_populates="course", cascade="all, delete-orphan"
    )
    enrollments: Mapped[List["Enrollment"]] = relationship(
        back_populates="course", cascade="all, delete-orphan"
    )
    orders: Mapped[List["Order"]] = relationship(
        back_populates="course", cascade="all, delete-orphan"
    )
    live_rooms: Mapped[List["LiveRoom"]] = relationship(
        back_populates="course", cascade="all, delete-orphan"
    )
    
    __table_args__ = (
        Index("idx_course_slug", "slug"),
        Index("idx_course_owner", "owner_id"),
        Index("idx_course_published", "is_published"),
        CheckConstraint("price_inr >= 0", name="check_price_positive"),
    )


# Module Model
class Module(Base, TimestampMixin):
    __tablename__ = "modules"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Relationships
    course: Mapped["Course"] = relationship(back_populates="modules")
    lessons: Mapped[List["Lesson"]] = relationship(
        back_populates="module", cascade="all, delete-orphan"
    )
    
    __table_args__ = (
        UniqueConstraint("course_id", "order_index", name="uq_module_order"),
        Index("idx_module_course", "course_id"),
        Index("idx_module_order", "course_id", "order_index"),
    )


# Lesson Model
class Lesson(Base, TimestampMixin):
    __tablename__ = "lessons"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    module_id: Mapped[int] = mapped_column(ForeignKey("modules.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    video_key: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    video_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    duration_sec: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    free_preview: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    resources: Mapped[Optional[List[dict]]] = mapped_column(JSON, nullable=True)
    
    # Relationships
    module: Mapped["Module"] = relationship(back_populates="lessons")
    comments: Mapped[List["Comment"]] = relationship(
        back_populates="lesson", cascade="all, delete-orphan"
    )
    
    __table_args__ = (
        UniqueConstraint("module_id", "order_index", name="uq_lesson_order"),
        Index("idx_lesson_module", "module_id"),
        Index("idx_lesson_order", "module_id", "order_index"),
    )


# Comment Model
class Comment(Base, TimestampMixin):
    __tablename__ = "comments"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id"), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    parent_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("comments.id"), nullable=True
    )
    is_edited: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="comments")
    lesson: Mapped["Lesson"] = relationship(back_populates="comments")
    parent: Mapped[Optional["Comment"]] = relationship(
        remote_side=[id], backref="replies"
    )
    
    __table_args__ = (
        Index("idx_comment_lesson", "lesson_id"),
        Index("idx_comment_user", "user_id"),
        Index("idx_comment_created", "lesson_id", "created_at"),
    )


# Enrollment Model
class Enrollment(Base, TimestampMixin):
    __tablename__ = "enrollments"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"), nullable=False)
    status: Mapped[EnrollmentStatus] = mapped_column(
        Enum(EnrollmentStatus), 
        default=EnrollmentStatus.PENDING, 
        nullable=False
    )
    progress_percent: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    completed_lessons: Mapped[Optional[List[int]]] = mapped_column(JSON, nullable=True)
    certificate_issued: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    certificate_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="enrollments")
    course: Mapped["Course"] = relationship(back_populates="enrollments")
    
    __table_args__ = (
        UniqueConstraint("user_id", "course_id", name="uq_user_course_enrollment"),
        Index("idx_enrollment_user", "user_id"),
        Index("idx_enrollment_course", "course_id"),
        Index("idx_enrollment_status", "status"),
    )


# Order Model
class Order(Base, TimestampMixin):
    __tablename__ = "orders"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"), nullable=False)
    provider: Mapped[PaymentProvider] = mapped_column(
        Enum(PaymentProvider), 
        nullable=False
    )
    amount_inr: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[OrderStatus] = mapped_column(
        Enum(OrderStatus), 
        default=OrderStatus.CREATED, 
        nullable=False
    )
    provider_order_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    receipt_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    notes: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="orders")
    course: Mapped["Course"] = relationship(back_populates="orders")
    payments: Mapped[List["Payment"]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )
    
    __table_args__ = (
        Index("idx_order_user", "user_id"),
        Index("idx_order_course", "course_id"),
        Index("idx_order_status", "status"),
        Index("idx_order_provider", "provider"),
        Index("idx_order_receipt", "receipt_number"),
        CheckConstraint("amount_inr > 0", name="check_order_amount_positive"),
    )


# Payment Model
class Payment(Base, TimestampMixin):
    __tablename__ = "payments"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), nullable=False)
    provider_payment_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus), 
        default=PaymentStatus.PENDING, 
        nullable=False
    )
    amount_inr: Mapped[int] = mapped_column(Integer, nullable=False)
    method: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    meta_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Relationships
    order: Mapped["Order"] = relationship(back_populates="payments")
    
    __table_args__ = (
        Index("idx_payment_order", "order_id"),
        Index("idx_payment_status", "status"),
        Index("idx_payment_provider_id", "provider_payment_id"),
    )


# Live Room Model
class LiveRoom(Base, TimestampMixin):
    __tablename__ = "live_rooms"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    start_ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    sfu_provider: Mapped[SFUProvider] = mapped_column(
        Enum(SFUProvider), 
        default=SFUProvider.LIVEKIT, 
        nullable=False
    )
    room_name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    recording_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    max_participants: Mapped[int] = mapped_column(Integer, default=100, nullable=False)
    
    # Relationships
    course: Mapped["Course"] = relationship(back_populates="live_rooms")
    attendance_records: Mapped[List["Attendance"]] = relationship(
        back_populates="room", cascade="all, delete-orphan"
    )
    
    __table_args__ = (
        Index("idx_liveroom_course", "course_id"),
        Index("idx_liveroom_start", "start_ts"),
        Index("idx_liveroom_active", "is_active"),
        CheckConstraint("end_ts > start_ts", name="check_room_time_valid"),
    )


# Attendance Model
class Attendance(Base, TimestampMixin):
    __tablename__ = "attendance"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    room_id: Mapped[int] = mapped_column(ForeignKey("live_rooms.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    left_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    duration_sec: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Relationships
    room: Mapped["LiveRoom"] = relationship(back_populates="attendance_records")
    user: Mapped["User"] = relationship(back_populates="attendance_records")
    
    __table_args__ = (
        UniqueConstraint("room_id", "user_id", name="uq_room_user_attendance"),
        Index("idx_attendance_room", "room_id"),
        Index("idx_attendance_user", "user_id"),
    )


# Audit Log Model
class AuditLog(Base):
    __tablename__ = "audit_log"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    actor_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    target: Mapped[str] = mapped_column(String(100), nullable=False)
    target_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    meta: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False
    )
    
    # Relationships
    actor: Mapped["User"] = relationship(back_populates="audit_logs")
    
    __table_args__ = (
        Index("idx_audit_actor", "actor_id"),
        Index("idx_audit_action", "action"),
        Index("idx_audit_target", "target"),
        Index("idx_audit_created", "created_at"),
    )