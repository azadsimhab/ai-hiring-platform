from pydantic import BaseModel
from typing import Optional

class HiringRequestBase(BaseModel):
    job_title: str
    department: str
    manager: str
    level: Optional[str] = None
    salary_range: Optional[str] = None
    benefits_perks: Optional[str] = None
    locations: str
    urgency: str
    other_remarks: Optional[str] = None
    employment_type: str
    hiring_type: str

class HiringRequestCreate(HiringRequestBase):
    pass

class HiringRequest(HiringRequestBase):
    id: int

    class Config:
        from_attributes = True