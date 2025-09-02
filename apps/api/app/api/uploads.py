from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
import boto3
from botocore.client import Config
from typing import Optional
import uuid
import mimetypes

from app.core.config import settings
from app.db.database import get_db
from app.schemas import PresignedUploadURL, FileUploadResponse

router = APIRouter()


def get_s3_client():
    """
    Get configured S3 client for Cloudflare R2
    """
    return boto3.client(
        "s3",
        endpoint_url=settings.R2_ENDPOINT,
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )


@router.post("/presign", response_model=PresignedUploadURL)
async def create_presigned_upload_url(
    filename: str,
    content_type: str,
    folder: str = "uploads",
    db: AsyncSession = Depends(get_db)
):
    """
    Generate a presigned URL for direct upload to R2
    """
    # TODO: Add authentication and authorization checks
    
    # Validate content type
    allowed_types = {
        "video": ["video/mp4", "video/webm", "video/quicktime"],
        "image": ["image/jpeg", "image/png", "image/gif", "image/webp"],
        "document": ["application/pdf", "application/msword", 
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    }
    
    # Generate unique key
    file_extension = filename.split(".")[-1] if "." in filename else ""
    unique_key = f"{folder}/{uuid.uuid4()}.{file_extension}"
    
    try:
        s3 = get_s3_client()
        
        # Generate presigned URL
        url = s3.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": settings.R2_BUCKET,
                "Key": unique_key,
                "ContentType": content_type,
            },
            ExpiresIn=900,  # 15 minutes
            HttpMethod="PUT",
        )
        
        return {
            "upload_url": url,
            "key": unique_key,
            "expires_in": 900
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate upload URL: {str(e)}"
        )


@router.post("/complete", response_model=FileUploadResponse)
async def complete_upload(
    key: str,
    size_bytes: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Mark upload as complete and return public URL
    """
    # TODO: Verify file exists in R2
    # TODO: Update database with file metadata
    # TODO: Trigger any post-processing (thumbnails, transcoding)
    
    content_type = mimetypes.guess_type(key)[0] or "application/octet-stream"
    file_url = f"{settings.R2_PUBLIC_URL}/{key}"
    
    return {
        "file_key": key,
        "file_url": file_url,
        "content_type": content_type,
        "size_bytes": size_bytes
    }


@router.delete("/{key:path}")
async def delete_file(
    key: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a file from R2 storage
    """
    # TODO: Add authentication and authorization checks
    # TODO: Check if file is referenced in database
    
    try:
        s3 = get_s3_client()
        s3.delete_object(Bucket=settings.R2_BUCKET, Key=key)
        return {"message": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete file: {str(e)}"
        )


@router.get("/download/{key:path}")
async def get_download_url(
    key: str,
    expires_in: int = 3600,
    db: AsyncSession = Depends(get_db)
):
    """
    Generate a presigned URL for downloading a file
    """
    # TODO: Add authentication and authorization checks
    
    try:
        s3 = get_s3_client()
        
        url = s3.generate_presigned_url(
            ClientMethod="get_object",
            Params={
                "Bucket": settings.R2_BUCKET,
                "Key": key,
            },
            ExpiresIn=expires_in,
        )
        
        return {"download_url": url, "expires_in": expires_in}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate download URL: {str(e)}"
        )