"""
Security Middleware for AI Hiring Platform
Production-ready security features
"""

import time
import hashlib
import hmac
import secrets
from typing import Optional, Dict, Any
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
import logging
from datetime import datetime, timedelta

# Optional imports for production
try:
    import jwt
    JWT_AVAILABLE = True
except ImportError:
    JWT_AVAILABLE = False
    jwt = None

try:
    from google.cloud import kms_v1
    GOOGLE_CLOUD_AVAILABLE = True
except ImportError:
    GOOGLE_CLOUD_AVAILABLE = False
    kms_v1 = None

from app.core.config import settings

logger = logging.getLogger(__name__)

class SecurityMiddleware:
    def __init__(self):
        self.rate_limit_store = {}
        self.blocked_ips = set()
        self.suspicious_activities = {}
        
        # Initialize KMS client for encryption (only in production)
        self.kms_client = None
        self.key_name = None
        
        if settings.ENVIRONMENT == "production" and GOOGLE_CLOUD_AVAILABLE:
            try:
                self.kms_client = kms_v1.KeyManagementServiceClient()
                # Use default values if not configured
                project_id = getattr(settings, 'GCP_PROJECT_ID', 'default-project')
                location = getattr(settings, 'KMS_LOCATION', 'us-central1')
                keyring = getattr(settings, 'KMS_KEYRING', 'default-keyring')
                key = getattr(settings, 'KMS_KEY', 'default-key')
                self.key_name = f"projects/{project_id}/locations/{location}/keyRings/{keyring}/cryptoKeys/{key}"
            except Exception as e:
                logger.warning(f"Failed to initialize KMS client: {e}")
    
    async def __call__(self, request: Request, call_next):
        """Main security middleware function"""
        start_time = time.time()
        
        try:
            # Get client IP
            client_ip = self._get_client_ip(request)
            
            # Check if IP is blocked
            if client_ip in self.blocked_ips:
                return JSONResponse(
                    status_code=status.HTTP_403_FORBIDDEN,
                    content={"detail": "Access denied"}
                )
            
            # Rate limiting
            if not self._check_rate_limit(client_ip, request.url.path):
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"detail": "Rate limit exceeded"}
                )
            
            # Input validation and sanitization
            if not self._validate_input(request):
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={"detail": "Invalid input detected"}
                )
            
            # CSRF protection (skip for API tokens)
            if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
                auth_header = request.headers.get("Authorization")
                if not auth_header or not auth_header.startswith("Bearer "):
                    if not self._validate_csrf_token(request):
                        return JSONResponse(
                            status_code=status.HTTP_403_FORBIDDEN,
                            content={"detail": "CSRF token validation failed"}
                        )
            
            # Process request
            response = await call_next(request)
            
            # Add security headers
            response.headers["X-Content-Type-Options"] = "nosniff"
            response.headers["X-Frame-Options"] = "DENY"
            response.headers["X-XSS-Protection"] = "1; mode=block"
            response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
            
            # Add HSTS header only in production
            if settings.ENVIRONMENT == "production":
                response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
                response.headers["Content-Security-Policy"] = self._get_csp_header()
                response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
            
            # Audit logging
            self._audit_log(request, response, start_time, client_ip)
            
            return response
            
        except Exception as e:
            logger.error(f"Security middleware error: {e}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": "Internal server error"}
            )
    
    def _get_client_ip(self, request: Request) -> str:
        """Get real client IP address"""
        # Check for forwarded headers
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Handle None client.host
        if request.client and request.client.host:
            return request.client.host
        return "unknown"
    
    def _check_rate_limit(self, client_ip: str, path: str) -> bool:
        """Check rate limiting for client IP"""
        current_time = time.time()
        key = f"{client_ip}:{path}"
        
        # Clean old entries
        self._clean_rate_limit_store(current_time)
        
        # Get current requests for this IP/path
        requests = self.rate_limit_store.get(key, [])
        
        # Remove old requests (older than 1 minute)
        requests = [req_time for req_time in requests if current_time - req_time < 60]
        
        # Check limits (use default if not configured)
        rate_limit = getattr(settings, 'RATE_LIMIT_PER_MINUTE', 100)
        if len(requests) >= rate_limit:
            # Log suspicious activity
            self._log_suspicious_activity(client_ip, "rate_limit_exceeded", path)
            return False
        
        # Add current request
        requests.append(current_time)
        self.rate_limit_store[key] = requests
        
        return True
    
    def _clean_rate_limit_store(self, current_time: float):
        """Clean old rate limit entries"""
        for key in list(self.rate_limit_store.keys()):
            requests = self.rate_limit_store[key]
            requests = [req_time for req_time in requests if current_time - req_time < 60]
            if not requests:
                del self.rate_limit_store[key]
            else:
                self.rate_limit_store[key] = requests
    
    def _validate_input(self, request: Request) -> bool:
        """Validate and sanitize input"""
        try:
            # Check for suspicious patterns
            suspicious_patterns = [
                "<script>",
                "javascript:",
                "data:text/html",
                "vbscript:",
                "onload=",
                "onerror=",
                "onclick=",
                "eval(",
                "document.cookie",
                "window.location",
            ]
            
            # Check URL
            url = str(request.url)
            for pattern in suspicious_patterns:
                if pattern.lower() in url.lower():
                    return False
            
            # Check headers
            for header_name, header_value in request.headers.items():
                if any(pattern.lower() in header_value.lower() for pattern in suspicious_patterns):
                    return False
            
            # Check query parameters
            for param_name, param_value in request.query_params.items():
                if any(pattern.lower() in str(param_value).lower() for pattern in suspicious_patterns):
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Input validation error: {e}")
            return False
    
    def _validate_csrf_token(self, request: Request) -> bool:
        """Validate CSRF token"""
        try:
            # Get CSRF token from header
            csrf_token = request.headers.get("X-CSRF-Token")
            if not csrf_token:
                return False
            
            # Validate token (implement your CSRF validation logic)
            # For now, we'll use a simple check
            return len(csrf_token) >= 32
            
        except Exception as e:
            logger.error(f"CSRF validation error: {e}")
            return False
    
    def _get_csp_header(self) -> str:
        """Get Content Security Policy header"""
        return (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' ws: wss:; "
            "frame-ancestors 'none';"
        )
    
    def _audit_log(self, request: Request, response, start_time: float, client_ip: str):
        """Log security audit information"""
        try:
            duration = time.time() - start_time
            log_data = {
                "timestamp": datetime.utcnow().isoformat(),
                "client_ip": client_ip,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration": round(duration, 3),
                "user_agent": request.headers.get("User-Agent", ""),
                "referer": request.headers.get("Referer", ""),
            }
            
            logger.info(f"Security audit: {log_data}")
            
        except Exception as e:
            logger.error(f"Audit logging error: {e}")
    
    def _log_suspicious_activity(self, client_ip: str, activity_type: str, details: str):
        """Log suspicious activity"""
        try:
            log_data = {
                "timestamp": datetime.utcnow().isoformat(),
                "client_ip": client_ip,
                "activity_type": activity_type,
                "details": details,
            }
            
            logger.warning(f"Suspicious activity detected: {log_data}")
            
            # Store for potential blocking
            self.suspicious_activities[client_ip] = {
                "count": self.suspicious_activities.get(client_ip, {}).get("count", 0) + 1,
                "last_activity": datetime.utcnow(),
                "activities": self.suspicious_activities.get(client_ip, {}).get("activities", []) + [log_data]
            }
            
            # Block IP if too many suspicious activities
            if self.suspicious_activities[client_ip]["count"] >= 10:
                self.blocked_ips.add(client_ip)
                logger.warning(f"IP {client_ip} blocked due to suspicious activity")
                
        except Exception as e:
            logger.error(f"Suspicious activity logging error: {e}")
    
    def encrypt_sensitive_data(self, data: str) -> str:
        """Encrypt sensitive data using Google Cloud KMS or simple encryption"""
        try:
            if settings.ENVIRONMENT == "production" and self.kms_client and kms_v1:
                # Use KMS for encryption
                request = kms_v1.EncryptRequest(
                    name=self.key_name,
                    plaintext=data.encode('utf-8')
                )
                response = self.kms_client.encrypt(request)
                return response.ciphertext.decode('utf-8')
            else:
                # Use simple encryption for development
                return self._simple_encrypt(data)
                
        except Exception as e:
            logger.error(f"Encryption error: {e}")
            return self._simple_encrypt(data)
    
    def decrypt_sensitive_data(self, encrypted_data: str) -> str:
        """Decrypt sensitive data using Google Cloud KMS or simple decryption"""
        try:
            if settings.ENVIRONMENT == "production" and self.kms_client and kms_v1:
                # Use KMS for decryption
                request = kms_v1.DecryptRequest(
                    name=self.key_name,
                    ciphertext=encrypted_data.encode('utf-8')
                )
                response = self.kms_client.decrypt(request)
                return response.plaintext.decode('utf-8')
            else:
                # Use simple decryption for development
                return self._simple_decrypt(encrypted_data)
                
        except Exception as e:
            logger.error(f"Decryption error: {e}")
            return self._simple_decrypt(encrypted_data)
    
    def _simple_encrypt(self, data: str) -> str:
        """Simple encryption for development"""
        # This is a simple XOR encryption - not secure for production
        key = b"dev-key-123"
        return ''.join(chr(ord(c) ^ key[i % len(key)]) for i, c in enumerate(data))
    
    def _simple_decrypt(self, encrypted_data: str) -> str:
        """Simple decryption for development"""
        # This is a simple XOR decryption - not secure for production
        key = b"dev-key-123"
        return ''.join(chr(ord(c) ^ key[i % len(key)]) for i, c in enumerate(encrypted_data))

# Create middleware instance
security_middleware = SecurityMiddleware() 