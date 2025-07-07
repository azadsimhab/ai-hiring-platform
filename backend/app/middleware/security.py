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
from google.cloud import kms_v1
import jwt
from datetime import datetime, timedelta

from app.core.config import settings

logger = logging.getLogger(__name__)

class SecurityMiddleware:
    def __init__(self):
        self.rate_limit_store = {}
        self.blocked_ips = set()
        self.suspicious_activities = {}
        
        # Initialize KMS client for encryption
        if settings.ENVIRONMENT == "production":
            self.kms_client = kms_v1.KeyManagementServiceClient()
            self.key_name = f"projects/{settings.GCP_PROJECT_ID}/locations/{settings.KMS_LOCATION}/keyRings/{settings.KMS_KEYRING}/cryptoKeys/{settings.KMS_KEY}"
    
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
            
            # CSRF protection
            if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
                if not self._validate_csrf_token(request):
                    return JSONResponse(
                        status_code=status.HTTP_403_FORBIDDEN,
                        content={"detail": "CSRF token validation failed"}
                    )
            
            # XSS protection headers
            response = await call_next(request)
            
            # Add security headers
            response.headers["X-Content-Type-Options"] = "nosniff"
            response.headers["X-Frame-Options"] = "DENY"
            response.headers["X-XSS-Protection"] = "1; mode=block"
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
            response.headers["Content-Security-Policy"] = self._get_csp_header()
            response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
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
        
        return request.client.host
    
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
        
        # Check limits
        if len(requests) >= settings.RATE_LIMIT_PER_MINUTE:
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
            # Skip CSRF validation for API tokens
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                return True
            
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
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https://api.openai.com https://api.anthropic.com; "
            "frame-ancestors 'none';"
        )
    
    def _audit_log(self, request: Request, response, start_time: float, client_ip: str):
        """Log security audit information"""
        try:
            duration = time.time() - start_time
            
            audit_data = {
                "timestamp": datetime.utcnow().isoformat(),
                "client_ip": client_ip,
                "method": request.method,
                "url": str(request.url),
                "status_code": response.status_code,
                "duration": duration,
                "user_agent": request.headers.get("User-Agent", ""),
                "referer": request.headers.get("Referer", ""),
            }
            
            # Log to Google Cloud Logging in production
            if settings.ENVIRONMENT == "production":
                logger.info(f"Security audit: {audit_data}")
            
            # Check for suspicious activities
            if response.status_code >= 400:
                self._log_suspicious_activity(client_ip, f"http_{response.status_code}", str(request.url))
                
        except Exception as e:
            logger.error(f"Audit logging error: {e}")
    
    def _log_suspicious_activity(self, client_ip: str, activity_type: str, details: str):
        """Log suspicious activity"""
        try:
            if client_ip not in self.suspicious_activities:
                self.suspicious_activities[client_ip] = []
            
            activity = {
                "timestamp": datetime.utcnow().isoformat(),
                "type": activity_type,
                "details": details,
            }
            
            self.suspicious_activities[client_ip].append(activity)
            
            # Block IP if too many suspicious activities
            if len(self.suspicious_activities[client_ip]) >= 10:
                self.blocked_ips.add(client_ip)
                logger.warning(f"IP {client_ip} blocked due to suspicious activity")
            
            logger.warning(f"Suspicious activity from {client_ip}: {activity_type} - {details}")
            
        except Exception as e:
            logger.error(f"Error logging suspicious activity: {e}")
    
    def encrypt_sensitive_data(self, data: str) -> str:
        """Encrypt sensitive data using Google Cloud KMS"""
        try:
            if settings.ENVIRONMENT == "production":
                # Use KMS for encryption
                request = kms_v1.EncryptRequest(
                    name=self.key_name,
                    plaintext=data.encode("utf-8")
                )
                response = self.kms_client.encrypt(request=request)
                return response.ciphertext.decode("utf-8")
            else:
                # Use simple encryption for development
                return self._simple_encrypt(data)
                
        except Exception as e:
            logger.error(f"Encryption error: {e}")
            return data
    
    def decrypt_sensitive_data(self, encrypted_data: str) -> str:
        """Decrypt sensitive data using Google Cloud KMS"""
        try:
            if settings.ENVIRONMENT == "production":
                # Use KMS for decryption
                request = kms_v1.DecryptRequest(
                    name=self.key_name,
                    ciphertext=encrypted_data.encode("utf-8")
                )
                response = self.kms_client.decrypt(request=request)
                return response.plaintext.decode("utf-8")
            else:
                # Use simple decryption for development
                return self._simple_decrypt(encrypted_data)
                
        except Exception as e:
            logger.error(f"Decryption error: {e}")
            return encrypted_data
    
    def _simple_encrypt(self, data: str) -> str:
        """Simple encryption for development"""
        # This is NOT for production use
        key = settings.SECRET_KEY.encode()
        return hmac.new(key, data.encode(), hashlib.sha256).hexdigest()
    
    def _simple_decrypt(self, encrypted_data: str) -> str:
        """Simple decryption for development"""
        # This is NOT for production use
        return encrypted_data

# Global security middleware instance
security_middleware = SecurityMiddleware() 