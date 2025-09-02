from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Set, List

from app.db.database import get_db
from app.schemas import CommentCreate, CommentUpdate, CommentInDB, CommentWSMessage

router = APIRouter()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, lesson_id: str):
        await websocket.accept()
        if lesson_id not in self.active_connections:
            self.active_connections[lesson_id] = set()
        self.active_connections[lesson_id].add(websocket)
    
    def disconnect(self, websocket: WebSocket, lesson_id: str):
        if lesson_id in self.active_connections:
            self.active_connections[lesson_id].discard(websocket)
            if not self.active_connections[lesson_id]:
                del self.active_connections[lesson_id]
    
    async def broadcast_to_lesson(self, lesson_id: str, message: str):
        if lesson_id in self.active_connections:
            dead_connections = set()
            for connection in self.active_connections[lesson_id]:
                try:
                    await connection.send_text(message)
                except:
                    dead_connections.add(connection)
            
            # Clean up dead connections
            for conn in dead_connections:
                self.disconnect(conn, lesson_id)


manager = ConnectionManager()


@router.websocket("/ws/lesson/{lesson_id}")
async def comments_websocket(
    websocket: WebSocket,
    lesson_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    WebSocket endpoint for real-time comments
    """
    await manager.connect(websocket, lesson_id)
    try:
        while True:
            data = await websocket.receive_text()
            # TODO: Process and broadcast comment
            await manager.broadcast_to_lesson(lesson_id, data)
    except WebSocketDisconnect:
        manager.disconnect(websocket, lesson_id)


@router.get("/lesson/{lesson_id}", response_model=List[CommentInDB])
async def get_lesson_comments(
    lesson_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all comments for a lesson
    """
    # TODO: Implement comment retrieval
    return []


@router.post("/", response_model=CommentInDB)
async def create_comment(
    comment: CommentCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new comment
    """
    # TODO: Implement comment creation
    return {"message": "Comment creation - to be implemented"}


@router.put("/{comment_id}", response_model=CommentInDB)
async def update_comment(
    comment_id: int,
    comment_update: CommentUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update a comment (owner only)
    """
    # TODO: Implement comment update
    return {"message": "Comment update - to be implemented"}


@router.delete("/{comment_id}")
async def delete_comment(
    comment_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a comment (owner/admin only)
    """
    # TODO: Implement comment deletion
    return {"message": "Comment deleted successfully"}