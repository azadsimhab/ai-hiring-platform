from sqlalchemy import Column, Integer, String
from .database import Base

class HiringRequest(Base):
    __tablename__ = "hiring_requests"

    id = Column(Integer, primary_key=True, index=True)
    job_title = Column(String, index=True)
    department = Column(String)
    manager = Column(String)
    level = Column(String, nullable=True)
    salary_range = Column(String, nullable=True)
    benefits_perks = Column(String, nullable=True)
    locations = Column(String)
    urgency = Column(String)
    other_remarks = Column(String, nullable=True)
    employment_type = Column(String)
    hiring_type = Column(String)