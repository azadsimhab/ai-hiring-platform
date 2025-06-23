# backend/models.py

from sqlalchemy import Column, Integer, String, Text
from .database import Base

class HiringRequest(Base):
    """
    Database model for a Hiring Request.
    This class defines the structure of the 'hiring_requests' table.
    """
    __tablename__ = "hiring_requests"

    id = Column(Integer, primary_key=True, index=True)
    job_title = Column(String(255), nullable=False, index=True)
    department = Column(String(255), nullable=False, index=True)
    manager = Column(String(255), nullable=False)
    level = Column(String(100))
    salary_range = Column(String(100))
    benefits_perks = Column(Text, nullable=True)
    locations = Column(String(255))
    urgency = Column(String(50))
    other_remarks = Column(Text, nullable=True)
    employment_type = Column(String(50)) # e.g., 'Temporary' or 'Permanent'
    hiring_type = Column(String(50))     # e.g., 'Internal' or 'External'