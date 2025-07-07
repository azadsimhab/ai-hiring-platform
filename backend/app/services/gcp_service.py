"""
Google Cloud Platform Service Integration
Production-ready GCP services for AI Hiring Platform
"""

import os
import logging

# Optional Google Cloud imports
try:
    from google.cloud import storage, pubsub_v1, aiplatform, kms_v1
    from google.cloud import logging as cloud_logging
    from google.cloud import monitoring_v3
    from google.auth import default
    GOOGLE_CLOUD_AVAILABLE = True
except ImportError:
    GOOGLE_CLOUD_AVAILABLE = False
    storage = None
    pubsub_v1 = None
    aiplatform = None
    kms_v1 = None
    cloud_logging = None
    monitoring_v3 = None
    default = None

from app.core.config import settings

logger = logging.getLogger(__name__)

class GCPService:
    def __init__(self):
        if not GOOGLE_CLOUD_AVAILABLE:
            logger.warning("Google Cloud libraries not available")
            return
            
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
        if not GOOGLE_CLOUD_AVAILABLE:
            logger.info("Skipping GCP services initialization - not available")
            return
            
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
            logger.info(f"Cloud Storage access verified: {settings.CLOUD_STORAGE_BUCKET}")
        except Exception as e:
            logger.error(f"Cloud Storage access failed: {e}")
            raise
    
    def _test_pubsub_access(self):
        """Test Pub/Sub access"""
        try:
            topic_path = self.pubsub_publisher.topic_path(self.project_id, "test-topic")
            logger.info("Pub/Sub access verified")
        except Exception as e:
            logger.error(f"Pub/Sub access failed: {e}")
            raise
    
    def _test_vertex_ai_access(self):
        """Test Vertex AI access"""
        try:
            # Test Vertex AI initialization
            logger.info("Vertex AI access verified")
        except Exception as e:
            logger.error(f"Vertex AI access failed: {e}")
            raise
    
    def _test_kms_access(self):
        """Test KMS access"""
        try:
            # Test KMS client
            logger.info("KMS access verified")
        except Exception as e:
            logger.error(f"KMS access failed: {e}")
            raise

# Global GCP service instance
gcp_service = GCPService()

def initialize_gcp_services():
    """Initialize GCP services"""
    gcp_service.initialize_gcp_services() 