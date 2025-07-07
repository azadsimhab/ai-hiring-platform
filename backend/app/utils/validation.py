"""
Advanced Input Validation and Sanitization
Production-ready validation utilities
"""

import re
import html
import urllib.parse
from typing import Any, Dict, List, Optional, Union
from datetime import datetime
import logging
from pydantic import BaseModel, validator, ValidationError
import bleach

logger = logging.getLogger(__name__)

class SecureInputValidator:
    """Secure input validation and sanitization"""
    
    def __init__(self):
        # Define allowed HTML tags and attributes
        self.allowed_tags = [
            'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
        ]
        
        self.allowed_attributes = {
            '*': ['class', 'id'],
            'a': ['href', 'title', 'target'],
            'img': ['src', 'alt', 'title', 'width', 'height'],
        }
        
        # Suspicious patterns
        self.suspicious_patterns = [
            r'<script[^>]*>.*?</script>',
            r'javascript:',
            r'vbscript:',
            r'on\w+\s*=',
            r'data:text/html',
            r'data:application/',
            r'<iframe[^>]*>',
            r'<object[^>]*>',
            r'<embed[^>]*>',
            r'<form[^>]*>',
            r'<input[^>]*>',
            r'<textarea[^>]*>',
            r'<select[^>]*>',
            r'<button[^>]*>',
            r'<link[^>]*>',
            r'<meta[^>]*>',
            r'<style[^>]*>',
            r'<base[^>]*>',
            r'<bgsound[^>]*>',
            r'<link[^>]*>',
            r'<meta[^>]*>',
            r'<title[^>]*>',
            r'<xmp[^>]*>',
            r'<plaintext[^>]*>',
            r'<listing[^>]*>',
        ]
        
        # Compile patterns for performance
        self.suspicious_regex = re.compile('|'.join(self.suspicious_patterns), re.IGNORECASE | re.DOTALL)
    
    def sanitize_text(self, text: str, allow_html: bool = False) -> str:
        """Sanitize text input"""
        if not text:
            return ""
        
        try:
            # Decode HTML entities
            text = html.unescape(text)
            
            # Remove null bytes
            text = text.replace('\x00', '')
            
            # Normalize whitespace
            text = ' '.join(text.split())
            
            if allow_html:
                # Use bleach for HTML sanitization
                text = bleach.clean(
                    text,
                    tags=self.allowed_tags,
                    attributes=self.allowed_attributes,
                    strip=True
                )
            else:
                # Remove all HTML tags
                text = bleach.clean(text, tags=[], strip=True)
            
            # Check for suspicious patterns
            if self.suspicious_regex.search(text):
                logger.warning(f"Suspicious pattern detected in text: {text[:100]}...")
                return ""
            
            return text.strip()
            
        except Exception as e:
            logger.error(f"Error sanitizing text: {e}")
            return ""
    
    def sanitize_url(self, url: str) -> str:
        """Sanitize URL input"""
        if not url:
            return ""
        
        try:
            # Parse URL
            parsed = urllib.parse.urlparse(url)
            
            # Check for dangerous schemes
            dangerous_schemes = ['javascript', 'vbscript', 'data', 'file']
            if parsed.scheme.lower() in dangerous_schemes:
                logger.warning(f"Dangerous URL scheme detected: {url}")
                return ""
            
            # Reconstruct URL with only safe components
            safe_url = urllib.parse.urlunparse((
                parsed.scheme,
                parsed.netloc,
                parsed.path,
                parsed.params,
                parsed.query,
                ''  # Remove fragment
            ))
            
            return safe_url
            
        except Exception as e:
            logger.error(f"Error sanitizing URL: {e}")
            return ""
    
    def sanitize_email(self, email: str) -> str:
        """Sanitize email input"""
        if not email:
            return ""
        
        try:
            # Basic email validation
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, email):
                logger.warning(f"Invalid email format: {email}")
                return ""
            
            # Sanitize email
            email = email.lower().strip()
            email = re.sub(r'[^\w@.-]', '', email)
            
            return email
            
        except Exception as e:
            logger.error(f"Error sanitizing email: {e}")
            return ""
    
    def sanitize_filename(self, filename: str) -> str:
        """Sanitize filename input"""
        if not filename:
            return ""
        
        try:
            # Remove dangerous characters
            dangerous_chars = ['<', '>', ':', '"', '|', '?', '*', '\\', '/']
            for char in dangerous_chars:
                filename = filename.replace(char, '_')
            
            # Remove null bytes and control characters
            filename = ''.join(char for char in filename if ord(char) >= 32)
            
            # Limit length
            if len(filename) > 255:
                filename = filename[:255]
            
            return filename.strip()
            
        except Exception as e:
            logger.error(f"Error sanitizing filename: {e}")
            return ""
    
    def validate_json(self, json_data: Any) -> bool:
        """Validate JSON data structure"""
        try:
            if not isinstance(json_data, (dict, list)):
                return False
            
            # Check for circular references
            self._check_circular_references(json_data)
            
            # Check for suspicious keys
            if isinstance(json_data, dict):
                for key in json_data.keys():
                    if self._is_suspicious_key(key):
                        logger.warning(f"Suspicious JSON key detected: {key}")
                        return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error validating JSON: {e}")
            return False
    
    def _check_circular_references(self, obj: Any, visited: Optional[set] = None):
        """Check for circular references in objects"""
        if visited is None:
            visited = set()
        
        obj_id = id(obj)
        if obj_id in visited:
            raise ValueError("Circular reference detected")
        
        visited.add(obj_id)
        
        if isinstance(obj, dict):
            for value in obj.values():
                self._check_circular_references(value, visited)
        elif isinstance(obj, list):
            for item in obj:
                self._check_circular_references(item, visited)
        
        visited.remove(obj_id)
    
    def _is_suspicious_key(self, key: str) -> bool:
        """Check if a key is suspicious"""
        suspicious_patterns = [
            r'__.*__',  # Magic methods
            r'<.*>',    # HTML tags
            r'javascript:',
            r'data:',
            r'file:',
        ]
        
        for pattern in suspicious_patterns:
            if re.search(pattern, key, re.IGNORECASE):
                return True
        
        return False

# Global validator instance
input_validator = SecureInputValidator()

# Pydantic models with secure validation
class SecureUserCreate(BaseModel):
    email: str
    username: str
    first_name: str
    last_name: str
    password: str
    
    @validator('email')
    def validate_email(cls, v):
        sanitized = input_validator.sanitize_email(v)
        if not sanitized:
            raise ValueError('Invalid email format')
        return sanitized
    
    @validator('username')
    def validate_username(cls, v):
        sanitized = input_validator.sanitize_text(v, allow_html=False)
        if len(sanitized) < 3 or len(sanitized) > 50:
            raise ValueError('Username must be between 3 and 50 characters')
        return sanitized
    
    @validator('first_name', 'last_name')
    def validate_name(cls, v):
        sanitized = input_validator.sanitize_text(v, allow_html=False)
        if len(sanitized) < 1 or len(sanitized) > 100:
            raise ValueError('Name must be between 1 and 100 characters')
        return sanitized
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        return v

class SecureHiringRequestCreate(BaseModel):
    title: str
    description: str
    department: str
    position: str
    priority: Optional[str] = "medium"
    budget_range: Optional[str] = None
    timeline_weeks: Optional[int] = None
    required_skills: Optional[List[str]] = []
    preferred_skills: Optional[List[str]] = []
    
    @validator('title', 'department', 'position')
    def validate_text_fields(cls, v):
        sanitized = input_validator.sanitize_text(v, allow_html=False)
        if len(sanitized) < 1 or len(sanitized) > 200:
            raise ValueError('Field must be between 1 and 200 characters')
        return sanitized
    
    @validator('description')
    def validate_description(cls, v):
        sanitized = input_validator.sanitize_text(v, allow_html=True)
        if len(sanitized) < 10 or len(sanitized) > 5000:
            raise ValueError('Description must be between 10 and 5000 characters')
        return sanitized
    
    @validator('required_skills', 'preferred_skills')
    def validate_skills(cls, v):
        if v is None:
            return []
        
        sanitized_skills = []
        for skill in v:
            sanitized = input_validator.sanitize_text(skill, allow_html=False)
            if sanitized and len(sanitized) <= 100:
                sanitized_skills.append(sanitized)
        
        return sanitized_skills[:20]  # Limit to 20 skills
    
    @validator('timeline_weeks')
    def validate_timeline(cls, v):
        if v is not None and (v < 1 or v > 52):
            raise ValueError('Timeline must be between 1 and 52 weeks')
        return v 