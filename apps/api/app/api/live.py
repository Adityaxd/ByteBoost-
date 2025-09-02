from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
import jwt
import time
from typing import List, Optional

from app.core.config import settings
from app.db.database import get_db
from app.schemas import LiveRoomCreate, LiveRoomUpdate, LiveRoomInDB, AttendanceInDB

router = APIRouter()


def generate_livekit_token(
    room_name: str,
    identity: str,
    name: str,
    can_publish: bool = True,
    can_subscribe: bool = True
) -> str:
    """
    Generate a LiveKit access token for a user to join a room
    """
    # TODO: Move to services/rtc_tokens.py
    
    if not settings.LIVEKIT_API_KEY or not settings.LIVEKIT_API_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="LiveKit not configured"
        )
    
    payload = {
        "iss": settings.LIVEKIT_API_KEY,
        "sub": identity,
        "iat": int(time.time()),
        "exp": int(time.time()) + 3600,  # 1 hour expiry
        "name": name,
        "video": {
            "room": room_name,
            "roomJoin": True,
            "canPublish": can_publish,
            "canSubscribe": can_subscribe,
            "canPublishData": True,
        },
        "metadata": "",
    }
    
    token = jwt.encode(
        payload,
        settings.LIVEKIT_API_SECRET,
        algorithm="HS256"
    )
    
    return token


@router.post("/rooms", response_model=LiveRoomInDB)
async def create_live_room(
    room: LiveRoomCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new live room for a course
    """
    # TODO: Implement room creation
    # 1. Verify user is instructor/admin
    # 2. Check course ownership
    # 3. Generate unique room name
    # 4. Create room in database
    # 5. Optionally create room in LiveKit
    
    return {"message": "Live room creation - to be implemented"}


@router.get("/rooms", response_model=List[LiveRoomInDB])
async def list_live_rooms(
    course_id: Optional[int] = None,
    active_only: bool = True,
    db: AsyncSession = Depends(get_db)
):
    """
    List live rooms, optionally filtered by course
    """
    # TODO: Implement room listing with filters
    return []


@router.get("/rooms/{room_id}", response_model=LiveRoomInDB)
async def get_live_room(
    room_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get live room details
    """
    # TODO: Implement room retrieval
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Live room not found"
    )


@router.post("/rooms/{room_id}/join")
async def join_live_room(
    room_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Join a live room and get access token
    """
    # TODO: Implement room joining
    # 1. Verify user has access (enrolled in course)
    # 2. Check room is active and within time window
    # 3. Generate access token
    # 4. Record attendance
    
    # Mock response for now
    return {
        "token": "mock-token",
        "url": settings.LIVEKIT_URL,
        "room_name": "room-123"
    }


@router.post("/rooms/{room_id}/leave")
async def leave_live_room(
    room_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Leave a live room and update attendance
    """
    # TODO: Update attendance record with leave time
    return {"message": "Left room successfully"}


@router.put("/rooms/{room_id}", response_model=LiveRoomInDB)
async def update_live_room(
    room_id: int,
    room_update: LiveRoomUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update live room details
    """
    # TODO: Implement room update
    # 1. Verify ownership
    # 2. Update room details
    # 3. Notify participants if active
    
    return {"message": "Live room update - to be implemented"}


@router.delete("/rooms/{room_id}")
async def delete_live_room(
    room_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a live room
    """
    # TODO: Implement room deletion
    # 1. Verify ownership
    # 2. Check room is not active
    # 3. Delete from database
    
    return {"message": "Live room deleted successfully"}


@router.get("/rooms/{room_id}/attendance", response_model=List[AttendanceInDB])
async def get_room_attendance(
    room_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get attendance records for a live room
    """
    # TODO: Implement attendance retrieval
    return []


@router.post("/rooms/{room_id}/start-recording")
async def start_recording(
    room_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Start recording a live room
    """
    # TODO: Implement recording start
    # 1. Verify ownership
    # 2. Call LiveKit recording API
    # 3. Update room status
    
    return {"message": "Recording started"}


@router.post("/rooms/{room_id}/stop-recording")
async def stop_recording(
    room_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Stop recording a live room
    """
    # TODO: Implement recording stop
    # 1. Verify ownership
    # 2. Call LiveKit recording API
    # 3. Update room with recording URL
    
    return {"message": "Recording stopped"}