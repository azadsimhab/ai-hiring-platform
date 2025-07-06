import os
import logging
import asyncio
from typing import Optional, Union, BinaryIO
from datetime import datetime, timedelta

from google.cloud import storage
from google.cloud.exceptions import GoogleCloudError
from google.auth.exceptions import DefaultCredentialsError

from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

# Default bucket name from settings
DEFAULT_BUCKET_NAME = getattr(settings, "GCP_STORAGE_BUCKET", "ai-hiring-platform-uploads")

# Default expiration time for signed URLs (in seconds)
DEFAULT_URL_EXPIRATION = 3600  # 1 hour


class StorageService:
    """Service for handling file storage operations with Google Cloud Storage"""
    
    _instance = None
    _client = None
    
    def __new__(cls):
        """Singleton pattern to ensure only one instance of the storage client exists"""
        if cls._instance is None:
            cls._instance = super(StorageService, cls).__new__(cls)
            try:
                # Initialize the storage client
                cls._client = storage.Client()
                logger.info("Google Cloud Storage client initialized successfully")
            except DefaultCredentialsError as e:
                logger.error(f"Failed to initialize Google Cloud Storage client: {str(e)}")
                logger.warning("Using local file system fallback for storage")
                cls._client = None
            except Exception as e:
                logger.error(f"Unexpected error initializing storage client: {str(e)}")
                cls._client = None
        return cls._instance
    
    @property
    def client(self):
        """Get the storage client instance"""
        return self._client
    
    def get_bucket(self, bucket_name: Optional[str] = None):
        """Get a bucket by name"""
        if not self.client:
            raise ValueError("Storage client not initialized")
        
        bucket_name = bucket_name or DEFAULT_BUCKET_NAME
        return self.client.bucket(bucket_name)
    
    async def upload_file(
        self, 
        file_path: str, 
        file_content: Union[bytes, BinaryIO], 
        content_type: Optional[str] = None,
        bucket_name: Optional[str] = None
    ) -> str:
        """
        Upload a file to Google Cloud Storage
        
        Args:
            file_path: The path/name for the file in storage
            file_content: The file content as bytes or file-like object
            content_type: The MIME type of the file
            bucket_name: Optional bucket name (uses default if not provided)
            
        Returns:
            The public URL of the uploaded file
        """
        try:
            if not self.client:
                return await self._local_upload_fallback(file_path, file_content)
            
            # Run in an executor to avoid blocking the event loop
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                lambda: self._upload_file_sync(file_path, file_content, content_type, bucket_name)
            )
            return result
        except Exception as e:
            logger.error(f"Error uploading file to {file_path}: {str(e)}")
            raise
    
    def _upload_file_sync(
        self, 
        file_path: str, 
        file_content: Union[bytes, BinaryIO], 
        content_type: Optional[str] = None,
        bucket_name: Optional[str] = None
    ) -> str:
        """Synchronous version of upload_file for use with executor"""
        bucket = self.get_bucket(bucket_name)
        blob = bucket.blob(file_path)
        
        # Set content type if provided
        if content_type:
            blob.content_type = content_type
        
        # Upload the file
        if hasattr(file_content, 'read'):
            # If it's a file-like object
            blob.upload_from_file(file_content)
        else:
            # If it's bytes
            blob.upload_from_string(file_content)
        
        logger.info(f"File uploaded successfully to {file_path}")
        return blob.public_url
    
    async def download_file(
        self, 
        file_path: str, 
        bucket_name: Optional[str] = None
    ) -> bytes:
        """
        Download a file from Google Cloud Storage
        
        Args:
            file_path: The path/name of the file in storage
            bucket_name: Optional bucket name (uses default if not provided)
            
        Returns:
            The file content as bytes
        """
        try:
            if not self.client:
                return await self._local_download_fallback(file_path)
            
            # Run in an executor to avoid blocking the event loop
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                lambda: self._download_file_sync(file_path, bucket_name)
            )
            return result
        except Exception as e:
            logger.error(f"Error downloading file from {file_path}: {str(e)}")
            raise
    
    def _download_file_sync(
        self, 
        file_path: str, 
        bucket_name: Optional[str] = None
    ) -> bytes:
        """Synchronous version of download_file for use with executor"""
        bucket = self.get_bucket(bucket_name)
        blob = bucket.blob(file_path)
        
        # Download the file
        content = blob.download_as_bytes()
        logger.info(f"File downloaded successfully from {file_path}")
        return content
    
    async def get_signed_url(
        self, 
        file_path: str, 
        expiration: int = DEFAULT_URL_EXPIRATION,
        bucket_name: Optional[str] = None
    ) -> str:
        """
        Generate a signed URL for accessing a file
        
        Args:
            file_path: The path/name of the file in storage
            expiration: URL expiration time in seconds
            bucket_name: Optional bucket name (uses default if not provided)
            
        Returns:
            A signed URL for the file
        """
        try:
            if not self.client:
                return await self._local_url_fallback(file_path)
            
            # Run in an executor to avoid blocking the event loop
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                lambda: self._get_signed_url_sync(file_path, expiration, bucket_name)
            )
            return result
        except Exception as e:
            logger.error(f"Error generating signed URL for {file_path}: {str(e)}")
            raise
    
    def _get_signed_url_sync(
        self, 
        file_path: str, 
        expiration: int = DEFAULT_URL_EXPIRATION,
        bucket_name: Optional[str] = None
    ) -> str:
        """Synchronous version of get_signed_url for use with executor"""
        bucket = self.get_bucket(bucket_name)
        blob = bucket.blob(file_path)
        
        # Generate signed URL
        url = blob.generate_signed_url(
            version="v4",
            expiration=datetime.utcnow() + timedelta(seconds=expiration),
            method="GET"
        )
        
        logger.info(f"Generated signed URL for {file_path} (expires in {expiration} seconds)")
        return url
    
    async def delete_file(
        self, 
        file_path: str, 
        bucket_name: Optional[str] = None
    ) -> bool:
        """
        Delete a file from Google Cloud Storage
        
        Args:
            file_path: The path/name of the file in storage
            bucket_name: Optional bucket name (uses default if not provided)
            
        Returns:
            True if deletion was successful, False otherwise
        """
        try:
            if not self.client:
                return await self._local_delete_fallback(file_path)
            
            # Run in an executor to avoid blocking the event loop
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                lambda: self._delete_file_sync(file_path, bucket_name)
            )
            return result
        except Exception as e:
            logger.error(f"Error deleting file {file_path}: {str(e)}")
            raise
    
    def _delete_file_sync(
        self, 
        file_path: str, 
        bucket_name: Optional[str] = None
    ) -> bool:
        """Synchronous version of delete_file for use with executor"""
        bucket = self.get_bucket(bucket_name)
        blob = bucket.blob(file_path)
        
        # Delete the file
        blob.delete()
        logger.info(f"File deleted successfully: {file_path}")
        return True
    
    async def check_file_exists(
        self, 
        file_path: str, 
        bucket_name: Optional[str] = None
    ) -> bool:
        """
        Check if a file exists in Google Cloud Storage
        
        Args:
            file_path: The path/name of the file in storage
            bucket_name: Optional bucket name (uses default if not provided)
            
        Returns:
            True if the file exists, False otherwise
        """
        try:
            if not self.client:
                return await self._local_exists_fallback(file_path)
            
            # Run in an executor to avoid blocking the event loop
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                lambda: self._check_file_exists_sync(file_path, bucket_name)
            )
            return result
        except Exception as e:
            logger.error(f"Error checking if file exists {file_path}: {str(e)}")
            return False
    
    def _check_file_exists_sync(
        self, 
        file_path: str, 
        bucket_name: Optional[str] = None
    ) -> bool:
        """Synchronous version of check_file_exists for use with executor"""
        bucket = self.get_bucket(bucket_name)
        blob = bucket.blob(file_path)
        return blob.exists()
    
    # Local filesystem fallback methods for development/testing
    async def _local_upload_fallback(self, file_path: str, file_content: Union[bytes, BinaryIO]) -> str:
        """Fallback to local filesystem for uploads when GCS is not available"""
        try:
            # Create local storage directory if it doesn't exist
            local_storage_dir = os.path.join(os.getcwd(), "local_storage")
            os.makedirs(local_storage_dir, exist_ok=True)
            
            # Create subdirectories if needed
            dir_path = os.path.dirname(os.path.join(local_storage_dir, file_path))
            os.makedirs(dir_path, exist_ok=True)
            
            # Write file
            local_path = os.path.join(local_storage_dir, file_path)
            mode = "wb"
            if hasattr(file_content, 'read'):
                content = file_content.read()
            else:
                content = file_content
                
            with open(local_path, mode) as f:
                f.write(content)
                
            logger.info(f"File uploaded to local storage: {local_path}")
            return f"file://{local_path}"
        except Exception as e:
            logger.error(f"Error in local file upload fallback: {str(e)}")
            raise
    
    async def _local_download_fallback(self, file_path: str) -> bytes:
        """Fallback to local filesystem for downloads when GCS is not available"""
        try:
            local_path = os.path.join(os.getcwd(), "local_storage", file_path)
            with open(local_path, "rb") as f:
                content = f.read()
            logger.info(f"File downloaded from local storage: {local_path}")
            return content
        except Exception as e:
            logger.error(f"Error in local file download fallback: {str(e)}")
            raise
    
    async def _local_url_fallback(self, file_path: str) -> str:
        """Fallback to local filesystem for URLs when GCS is not available"""
        local_path = os.path.join(os.getcwd(), "local_storage", file_path)
        logger.info(f"Generated local file URL: {local_path}")
        return f"file://{local_path}"
    
    async def _local_delete_fallback(self, file_path: str) -> bool:
        """Fallback to local filesystem for deletion when GCS is not available"""
        try:
            local_path = os.path.join(os.getcwd(), "local_storage", file_path)
            if os.path.exists(local_path):
                os.remove(local_path)
                logger.info(f"File deleted from local storage: {local_path}")
                return True
            else:
                logger.warning(f"File not found in local storage: {local_path}")
                return False
        except Exception as e:
            logger.error(f"Error in local file deletion fallback: {str(e)}")
            return False
    
    async def _local_exists_fallback(self, file_path: str) -> bool:
        """Fallback to local filesystem for existence check when GCS is not available"""
        local_path = os.path.join(os.getcwd(), "local_storage", file_path)
        exists = os.path.exists(local_path)
        return exists


# Create a singleton instance
_storage_service = StorageService()

# Convenience functions for using the storage service
async def upload_file(
    file_path: str, 
    file_content: Union[bytes, BinaryIO], 
    content_type: Optional[str] = None,
    bucket_name: Optional[str] = None
) -> str:
    """Upload a file to storage"""
    return await _storage_service.upload_file(file_path, file_content, content_type, bucket_name)

async def download_file(
    file_path: str, 
    bucket_name: Optional[str] = None
) -> bytes:
    """Download a file from storage"""
    return await _storage_service.download_file(file_path, bucket_name)

async def get_file_url(
    file_path: str, 
    expiration: int = DEFAULT_URL_EXPIRATION,
    bucket_name: Optional[str] = None
) -> str:
    """Get a signed URL for a file"""
    return await _storage_service.get_signed_url(file_path, expiration, bucket_name)

async def delete_file(
    file_path: str, 
    bucket_name: Optional[str] = None
) -> bool:
    """Delete a file from storage"""
    return await _storage_service.delete_file(file_path, bucket_name)

async def check_file_exists(
    file_path: str, 
    bucket_name: Optional[str] = None
) -> bool:
    """Check if a file exists in storage"""
    return await _storage_service.check_file_exists(file_path, bucket_name)
