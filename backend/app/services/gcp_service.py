"""
Google Cloud Platform Service Integration
Production-ready GCP services for AI Hiring Platform
"""

import os
import logging
from google.cloud import storage, pubsub_v1, aiplatform, kms_v1
from google.cloud import logging as cloud_logging
from google.cloud import monitoring_v3
from google.auth import default
from app.core.config import settings

logger = logging.getLogger(__name__)

class GCPService:
    def __init__(self):
        self.project_id = settings.GCP_PROJECT_ID
        self.region = settings.GCP_REGION
        self.credentials, _ = default()
        
        # Initialize clients
        self.storage_client = storage.Client(project=self.project_id)
        self.pubsub_publisher = pubsub_v1.PublisherClient()
        self.pubsub_subscriber = pubsub_v1.SubscriberClient()
        self.kms_client = kms_v1.KeyManagementServiceClient()
        
        # Initialize Vertex AI
        aiplatform.init(project=self.project_id, location=self.region)
        
    def initialize_gcp_services(self):
        """Initialize all GCP services"""
        logger.info("Initializing GCP services...")
        
        try:
            # Test storage access
            self._test_storage_access()
            
            # Test Pub/Sub access
            self._test_pubsub_access()
            
            # Test Vertex AI access
            self._test_vertex_ai_access()
            
            # Test KMS access
            self._test_kms_access()
            
            logger.info("All GCP services initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize GCP services: {e}")
            raise
    
    def _test_storage_access(self):
        """Test Cloud Storage access"""
        try:
            bucket = self.storage_client.bucket(settings.CLOUD_STORAGE_BUCKET)
            bucket.reload()
            logger.info(f"Cloud Storage access verified: 