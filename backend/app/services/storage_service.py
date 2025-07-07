"""
Storage Service with Google Cloud Storage Integration
Handles file uploads, downloads, and management
"""

import os
import uuid
import mimetypes
from typing import Optional, List, Dict, Any
from fastapi import UploadFile, HTTPException
from google.cloud import storage
from google.cloud.exceptions import NotFound
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

class StorageService:
    def __init__(self):
        self.client = storage.Client(project=settings.GCP_PROJECT_ID)
        self.buckets = {
            'resumes': settings.CLOUD_STORAGE_RESUMES,
            'videos': settings.CLOUD_STORAGE_VIDEOS,
            'logs': settings.CLOUD_STORAGE_LOGS,
            'backups': settings.CLOUD_STORAGE_BACKUPS,
            'general': settings.CLOUD_STORAGE_BUCKET
        }
        
        # Ensure buckets exist
        self._ensure_buckets_exist()
        
    def _ensure_buckets_exist(self):
        """Ensure all required buckets exist"""
        for bucket_name in self.buckets.values():
            try:
                bucket = self.client.bucket(bucket_name)
                if not bucket.exists():
                    bucket.create()
                    logger.info(f"Created bucket: {bucket_name}")
            except Exception as e:
                logger.error(f"Error ensuring bucket exists {bucket_name}: {e}")
    
    async def upload_file(self, file: UploadFile, bucket_type: str = 'general', 
                         folder: str = 'uploads') -> Dict[str, Any]:
        """Upload file to Google Cloud Storage"""
        try:
            # Validate file type
            if not self._is_allowed_file(file.filename):
                raise HTTPException(
                    status_code=400,
                    detail="File type not allowed"
                )
            
            # Generate unique filename
            file_extension = os.path.splitext(file.filename)[1]
            unique_filename = f"{folder}/{uuid.uuid4()}{file_extension}"
            
            # Get bucket
            bucket_name = self.buckets.get(bucket_type, self.buckets['general'])
            bucket = self.client.bucket(bucket_name)
            blob = bucket.blob(unique_filename)
            
            # Set content type
            content_type = mimetypes.guess_type(file.filename)[0]
            if content_type:
                blob.content_type = content_type
            
            # Upload file
            content = await file.read()
            blob.upload_from_string(content)
            
            # Make blob publicly readable (for certain file types)
            if bucket_type in ['resumes', 'videos']:
                blob.make_public()
            
            result = {
                "filename": unique_filename,
                "original_filename": file.filename,
                "bucket": bucket_name,
                "size": len(content),
                "content_type": content_type,
                "public_url": blob.public_url if blob.is_public else None,
                "gs_uri": f"gs://{bucket_name}/{unique_filename}"
            }
            
            logger.info(f"File uploaded successfully: {result['filename']}")
            return result
            
        except Exception as e:
            logger.error(f"Error uploading file: {e}")
            raise HTTPException(
                status_code=500,
                detail="Failed to upload file"
            )
    
    def download_file(self, filename: str, bucket_type: str = 'general') -> bytes:
        """Download file from Google Cloud Storage"""
        try:
            bucket_name = self.buckets.get(bucket_type, self.buckets['general'])
            bucket = self.client.bucket(bucket_name)
            blob = bucket.blob(filename)
            
            if not blob.exists():
                raise HTTPException(
                    status_code=404,
                    detail="File not found"
                )
            
            return blob.download_as_bytes()
            
        except Exception as e:
            logger.error(f"Error downloading file: {e}")
            raise HTTPException(
                status_code=500,
                detail="Failed to download file"
            )
    
    def delete_file(self, filename: str, bucket_type: str = 'general') -> bool:
        """Delete file from Google Cloud Storage"""
        try:
            bucket_name = self.buckets.get(bucket_type, self.buckets['general'])
            bucket = self.client.bucket(bucket_name)
            blob = bucket.blob(filename)
            
            if blob.exists():
                blob.delete()
                logger.info(f"File deleted: {filename}")
                return True
            else:
                logger.warning(f"File not found for deletion: {filename}")
                return False
                
        except Exception as e:
            logger.error(f"Error deleting file: {e}")
            return False
    
    def list_files(self, bucket_type: str = 'general', prefix: str = '') -> List[Dict[str, Any]]:
        """List files in bucket with optional prefix"""
        try:
            bucket_name = self.buckets.get(bucket_type, self.buckets['general'])
            bucket = self.client.bucket(bucket_name)
            
            blobs = bucket.list_blobs(prefix=prefix)
            
            files = []
            for blob in blobs:
                files.append({
                    "name": blob.name,
                    "size": blob.size,
                    "content_type": blob.content_type,
                    "created": blob.time_created,
                    "updated": blob.updated,
                    "public_url": blob.public_url if blob.is_public else None
                })
            
            return files
            
        except Exception as e:
            logger.error(f"Error listing files: {e}")
            return []
    
    def _is_allowed_file(self, filename: str) -> bool:
        """Check if file type is allowed"""
        if not filename:
            return False
            
        file_extension = os.path.splitext(filename)[1].lower()
        return file_extension in settings.ALLOWED_FILE_TYPES
    
    def get_signed_url(self, filename: str, bucket_type: str = 'general', 
                      expiration: int = 3600) -> str:
        """Generate signed URL for file access"""
        try:
            bucket_name = self.buckets.get(bucket_type, self.buckets['general'])
            bucket = self.client.bucket(bucket_name)
            blob = bucket.blob(filename)
            
            if not blob.exists():
                raise HTTPException(
                    status_code=404,
                    detail="File not found"
                )
            
            url = blob.generate_signed_url(
                version="v4",
                expiration=expiration,
                method="GET"
            )
            
            return url
            
        except Exception as e:
            logger.error(f"Error generating signed URL: {e}")
            raise HTTPException(
                status_code=500,
                detail="Failed to generate signed URL"
            )

# Global storage service instance
storage_service = StorageService()
