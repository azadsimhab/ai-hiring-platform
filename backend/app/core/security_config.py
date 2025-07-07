"""
Security Configuration for AI Hiring Platform
Comprehensive security settings and policies
"""

import os
from typing import List, Dict, Any
from pydantic import BaseSettings, validator
from datetime import timedelta

class SecurityConfig(BaseSettings):
    """Security configuration settings"""
    
    # Environment
    ENVIRONMENT: str = "development"
    
    # JWT Settings
    JWT_SECRET_KEY: str = "your-super-secret-jwt-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Password Security
    PASSWORD_MIN_LENGTH: int = 8
    PASSWORD_REQUIRE_UPPERCASE: bool = True
    PASSWORD_REQUIRE_LOWERCASE: bool = True
    PASSWORD_REQUIRE_NUMBERS: bool = True
    PASSWORD_REQUIRE_SPECIAL_CHARS: bool = True
    PASSWORD_HISTORY_COUNT: int = 5
    PASSWORD_EXPIRY_DAYS: int = 90
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000
    RATE_LIMIT_PER_DAY: int = 10000
    RATE_LIMIT_BURST: int = 10
    
    # Session Security
    SESSION_TIMEOUT_MINUTES: int = 30
    MAX_CONCURRENT_SESSIONS: int = 3
    SESSION_INACTIVITY_TIMEOUT: int = 15
    
    # Input Validation
    MAX_INPUT_LENGTH: int = 10000
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_FILE_TYPES: List[str] = [
        "pdf", "doc", "docx", "txt", "jpg", "jpeg", "png", "gif"
    ]
    BLOCKED_FILE_TYPES: List[str] = [
        "exe", "bat", "cmd", "com", "pif", "scr", "vbs", "js", "jar"
    ]
    
    # CSRF Protection
    CSRF_TOKEN_LENGTH: int = 32
    CSRF_TOKEN_EXPIRE_MINUTES: int = 30
    CSRF_REQUIRED_METHODS: List[str] = ["POST", "PUT", "DELETE", "PATCH"]
    
    # XSS Protection
    XSS_PROTECTION_ENABLED: bool = True
    XSS_BLOCK_MODE: str = "block"
    CONTENT_SECURITY_POLICY: str = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: https:; "
        "connect-src 'self' https://api.openai.com https://api.anthropic.com; "
        "frame-ancestors 'none';"
    )
    
    # Anti-Cheat Settings
    ANTI_CHEAT_ENABLED: bool = True
    SCREENSHOT_INTERVAL_SECONDS: int = 30
    KEYSTROKE_MONITORING: bool = True
    FOCUS_MONITORING: bool = True
    NETWORK_MONITORING: bool = True
    PLAGIARISM_THRESHOLD: float = 0.8
    SUSPICIOUS_ACTIVITY_THRESHOLD: int = 10
    
    # Encryption
    ENCRYPTION_ALGORITHM: str = "AES-256-GCM"
    KEY_ROTATION_DAYS: int = 90
    SENSITIVE_FIELDS: List[str] = [
        "password", "ssn", "credit_card", "bank_account", "api_key"
    ]
    
    # Audit Logging
    AUDIT_LOG_ENABLED: bool = True
    AUDIT_LOG_RETENTION_DAYS: int = 365
    AUDIT_LOG_LEVEL: str = "INFO"
    AUDIT_SENSITIVE_ACTIONS: List[str] = [
        "login", "logout", "password_change", "role_change", 
        "data_export", "admin_action", "payment", "api_key_generation"
    ]
    
    # Network Security
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1", "hiring-platform.com"]
    BLOCKED_IPS: List[str] = []
    PROXY_TRUSTED_HEADERS: List[str] = ["X-Forwarded-For", "X-Real-IP"]
    
    # API Security
    API_KEY_LENGTH: int = 32
    API_KEY_EXPIRE_DAYS: int = 365
    API_RATE_LIMIT_PER_KEY: int = 1000
    API_VERSIONING_ENABLED: bool = True
    
    # Database Security
    DB_CONNECTION_POOL_SIZE: int = 10
    DB_CONNECTION_TIMEOUT: int = 30
    DB_QUERY_TIMEOUT: int = 60
    DB_ENCRYPTION_ENABLED: bool = True
    
    # File Upload Security
    UPLOAD_MAX_SIZE_MB: int = 50
    UPLOAD_ALLOWED_EXTENSIONS: List[str] = [
        "pdf", "doc", "docx", "txt", "jpg", "jpeg", "png", "gif", "mp4", "avi"
    ]
    UPLOAD_SCAN_VIRUS: bool = True
    UPLOAD_VALIDATE_CONTENT: bool = True
    
    # Email Security
    EMAIL_VERIFICATION_REQUIRED: bool = True
    EMAIL_VERIFICATION_EXPIRE_HOURS: int = 24
    EMAIL_RATE_LIMIT_PER_HOUR: int = 10
    EMAIL_SPAM_PROTECTION: bool = True
    
    # OAuth Security
    OAUTH_ENABLED: bool = True
    OAUTH_PROVIDERS: List[str] = ["google", "microsoft", "linkedin"]
    OAUTH_STATE_TIMEOUT_MINUTES: int = 10
    OAUTH_REQUIRE_EMAIL_VERIFICATION: bool = True
    
    # Monitoring and Alerting
    SECURITY_MONITORING_ENABLED: bool = True
    ALERT_EMAIL_ENABLED: bool = True
    ALERT_WEBHOOK_ENABLED: bool = True
    ALERT_THRESHOLDS: Dict[str, int] = {
        "failed_logins": 5,
        "suspicious_activities": 10,
        "rate_limit_violations": 20,
        "file_upload_violations": 3
    }
    
    # Compliance
    GDPR_COMPLIANCE_ENABLED: bool = True
    DATA_RETENTION_DAYS: int = 2555  # 7 years
    DATA_ENCRYPTION_AT_REST: bool = True
    DATA_ENCRYPTION_IN_TRANSIT: bool = True
    PRIVACY_POLICY_URL: str = "https://hiring-platform.com/privacy"
    TERMS_OF_SERVICE_URL: str = "https://hiring-platform.com/terms"
    
    # GCP Security Settings
    GCP_PROJECT_ID: str = ""
    GCP_KMS_LOCATION: str = "global"
    GCP_KMS_KEYRING: str = "hiring-platform-keys"
    GCP_KMS_KEY: str = "data-encryption-key"
    GCP_SECRET_MANAGER_ENABLED: bool = True
    GCP_IAM_ENABLED: bool = True
    
    # Development Security
    DEBUG_MODE: bool = False
    EXPOSE_ERROR_DETAILS: bool = False
    ALLOW_INSECURE_CONNECTIONS: bool = False
    
    @validator('ENVIRONMENT')
    def validate_environment(cls, v):
        if v not in ['development', 'staging', 'production']:
            raise ValueError('Environment must be development, staging, or production')
        return v
    
    @validator('JWT_SECRET_KEY')
    def validate_jwt_secret(cls, v):
        if len(v) < 32:
            raise ValueError('JWT secret key must be at least 32 characters')
        return v
    
    @validator('PASSWORD_MIN_LENGTH')
    def validate_password_length(cls, v):
        if v < 8:
            raise ValueError('Password minimum length must be at least 8')
        return v
    
    @validator('RATE_LIMIT_PER_MINUTE')
    def validate_rate_limit(cls, v):
        if v < 1:
            raise ValueError('Rate limit must be at least 1')
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Security policies and rules
class SecurityPolicies:
    """Security policies and rules"""
    
    # Password policy
    PASSWORD_POLICY = {
        "min_length": 8,
        "require_uppercase": True,
        "require_lowercase": True,
        "require_numbers": True,
        "require_special_chars": True,
        "max_age_days": 90,
        "history_count": 5,
        "common_passwords_blocked": True
    }
    
    # Session policy
    SESSION_POLICY = {
        "max_duration_minutes": 30,
        "inactivity_timeout_minutes": 15,
        "max_concurrent_sessions": 3,
        "force_logout_on_password_change": True,
        "secure_cookies": True,
        "http_only_cookies": True,
        "same_site": "strict"
    }
    
    # Access control policy
    ACCESS_CONTROL_POLICY = {
        "default_role": "user",
        "admin_roles": ["admin", "super_admin"],
        "moderator_roles": ["moderator", "admin"],
        "require_email_verification": True,
        "require_phone_verification": False,
        "two_factor_required": False,
        "ip_whitelist_enabled": False
    }
    
    # Data protection policy
    DATA_PROTECTION_POLICY = {
        "encryption_at_rest": True,
        "encryption_in_transit": True,
        "data_retention_days": 2555,
        "data_anonymization_enabled": True,
        "gdpr_compliance": True,
        "data_export_enabled": True,
        "data_deletion_enabled": True
    }
    
    # API security policy
    API_SECURITY_POLICY = {
        "rate_limiting_enabled": True,
        "authentication_required": True,
        "authorization_required": True,
        "input_validation_required": True,
        "output_sanitization_required": True,
        "versioning_required": True,
        "deprecation_notice_days": 90
    }

# Security constants
class SecurityConstants:
    """Security constants and magic numbers"""
    
    # Token lengths
    JWT_TOKEN_LENGTH = 32
    API_KEY_LENGTH = 32
    CSRF_TOKEN_LENGTH = 32
    REFRESH_TOKEN_LENGTH = 64
    
    # Timeouts (in seconds)
    SESSION_TIMEOUT = 1800  # 30 minutes
    CSRF_TOKEN_TIMEOUT = 1800  # 30 minutes
    EMAIL_VERIFICATION_TIMEOUT = 86400  # 24 hours
    PASSWORD_RESET_TIMEOUT = 3600  # 1 hour
    
    # Rate limiting windows
    RATE_LIMIT_WINDOW_MINUTE = 60
    RATE_LIMIT_WINDOW_HOUR = 3600
    RATE_LIMIT_WINDOW_DAY = 86400
    
    # File upload limits
    MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50MB
    MAX_FILES_PER_REQUEST = 10
    MAX_TOTAL_UPLOAD_SIZE = 100 * 1024 * 1024  # 100MB
    
    # Input validation limits
    MAX_STRING_LENGTH = 10000
    MAX_ARRAY_LENGTH = 1000
    MAX_OBJECT_DEPTH = 10
    
    # Security headers
    SECURITY_HEADERS = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
    }
    
    # Blocked patterns
    BLOCKED_PATTERNS = [
        r"<script[^>]*>.*?</script>",
        r"javascript:",
        r"vbscript:",
        r"on\w+\s*=",
        r"data:text/html",
        r"data:application/",
        r"<iframe[^>]*>",
        r"<object[^>]*>",
        r"<embed[^>]*>",
        r"<form[^>]*>",
        r"<input[^>]*>",
        r"<textarea[^>]*>",
        r"<select[^>]*>",
        r"<button[^>]*>",
        r"<link[^>]*>",
        r"<meta[^>]*>",
        r"<style[^>]*>",
        r"<base[^>]*>",
        r"<bgsound[^>]*>",
        r"<title[^>]*>",
        r"<xmp[^>]*>",
        r"<plaintext[^>]*>",
        r"<listing[^>]*>",
    ]
    
    # Allowed HTML tags for sanitization
    ALLOWED_HTML_TAGS = [
        'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'img'
    ]
    
    # Allowed HTML attributes
    ALLOWED_HTML_ATTRIBUTES = {
        '*': ['class', 'id'],
        'a': ['href', 'title', 'target'],
        'img': ['src', 'alt', 'title', 'width', 'height'],
    }

# Create global security config instance
security_config = SecurityConfig()

# Export security policies and constants
security_policies = SecurityPolicies()
security_constants = SecurityConstants() 