from sqlalchemy import Column, String, Boolean, Enum, Text, DateTime, Integer
from sqlalchemy.orm import relationship
from .base import BaseModel
import enum
from .hiring_request import HiringRequest

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    HR_MANAGER = "hr_manager"
    RECRUITER = "recruiter"
    INTERVIEWER = "interviewer"
    VIEWER = "viewer"

class UserStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING_VERIFICATION = "pending_verification"

class User(BaseModel):
    __tablename__ = "users"
    
    # Basic information
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    
    # Authentication
    hashed_password = Column(String(255), nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    email_verified_at = Column(DateTime(timezone=True), nullable=True)
    
    # Profile
    phone = Column(String(20), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    
    # Role and permissions
    role = Column(Enum(UserRole), default=UserRole.VIEWER, nullable=False)
    status = Column(Enum(UserStatus), default=UserStatus.PENDING_VERIFICATION, nullable=False)
    
    # Security
    last_login = Column(DateTime(timezone=True), nullable=True)
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime(timezone=True), nullable=True)
    
    # Company/Organization
    company_id = Column(Integer, nullable=True, index=True)
    department = Column(String(100), nullable=True)
    position = Column(String(100), nullable=True)
    
    # Preferences
    timezone = Column(String(50), default="UTC", nullable=False)
    language = Column(String(10), default="en", nullable=False)
    
    # Relationships
    hiring_requests = relationship("HiringRequest", back_populates="created_by", foreign_keys="HiringRequest.created_by_id")
    approved_hiring_requests = relationship("HiringRequest", back_populates="approved_by", foreign_keys="HiringRequest.approved_by_id")
    interviews = relationship("Interview", back_populates="interviewer")
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def is_admin(self):
        return self.role == UserRole.ADMIN
    
    @property
    def can_manage_users(self):
        return self.role in [UserRole.ADMIN, UserRole.HR_MANAGER]
    
    @property
    def can_create_hiring_requests(self):
        return self.role in [UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER] 