"""
Production-ready User model with Google OAuth integration
Compatible with both PostgreSQL and SQLite
"""

from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

from .base import Base
from app.core.database_types import UniversalUUID, JSONDict


class User(Base):
    __tablename__ = "users"
    
    # Primary key - auto-increment for SQLite, UUID for PostgreSQL
    id = Column(Integer, primary_key=True, index=True)
    
    # Google OAuth fields
    google_id = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    profile_picture_url = Column(Text, nullable=True)
    
    # Company information
    company = Column(String(255), nullable=True)
    company_id = Column(Integer, nullable=True, index=True)
    
    # User role and permissions
    role = Column(String(50), nullable=False, default="user")  # user, admin, hr_manager, recruiter
    subscription_plan = Column(String(50), nullable=False, default="starter")  # starter, professional, enterprise
    
    # Account status
    is_active = Column(Boolean, nullable=False, default=True)
    is_verified = Column(Boolean, nullable=False, default=True)  # Google OAuth users are pre-verified
    
    # Authentication tokens (stored securely in production)
    access_token = Column(Text, nullable=True)  # For API access
    refresh_token = Column(Text, nullable=True)  # For token refresh
    
    # Session management
    last_login = Column(DateTime(timezone=True), nullable=True)
    session_expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # User preferences and settings (stored as JSON)
    preferences = Column(JSONDict, nullable=False, default={})
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)  # Soft delete
    
    # Security fields
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships (these will be added as other models are updated)
    # hiring_requests = relationship("HiringRequest", back_populates="user")
    # interviews = relationship("Interview", back_populates="interviewer")
    
    @property
    def is_admin(self) -> bool:
        """Check if user has admin privileges"""
        return self.role in ["admin", "super_admin"]
    
    @property
    def is_hr_manager(self) -> bool:
        """Check if user is an HR manager"""
        return self.role in ["admin", "hr_manager"]
    
    @property
    def can_create_hiring_requests(self) -> bool:
        """Check if user can create hiring requests"""
        return self.role in ["admin", "hr_manager", "recruiter"]
    
    @property
    def is_premium_user(self) -> bool:
        """Check if user has premium subscription"""
        return self.subscription_plan in ["professional", "enterprise"]
    
    @property
    def display_name(self) -> str:
        """Get display name for UI"""
        return self.name or self.email.split('@')[0]
    
    def update_last_login(self):
        """Update last login timestamp"""
        self.last_login = datetime.utcnow()
    
    def is_session_valid(self) -> bool:
        """Check if current session is still valid"""
        if not self.session_expires_at:
            return False
        return datetime.utcnow() < self.session_expires_at
    
    def set_session_expiry(self, hours: int = 24):
        """Set session expiry time"""
        from datetime import timedelta
        self.session_expires_at = datetime.utcnow() + timedelta(hours=hours)
    
    def get_preference(self, key: str, default=None):
        """Get user preference value"""
        return self.preferences.get(key, default)
    
    def set_preference(self, key: str, value):
        """Set user preference value"""
        if not self.preferences:
            self.preferences = {}
        self.preferences[key] = value
    
    def to_dict(self) -> dict:
        """Convert user to dictionary for API responses"""
        return {
            "id": str(self.id),
            "google_id": self.google_id,
            "email": self.email,
            "name": self.name,
            "company": self.company,
            "role": self.role,
            "subscription_plan": self.subscription_plan,
            "profile_picture_url": self.profile_picture_url,
            "is_active": self.is_active,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', name='{self.name}', role='{self.role}')>"