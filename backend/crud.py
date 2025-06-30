from sqlalchemy.orm import Session
from . import models, schemas


def create_hiring_request(db: Session, request: schemas.HiringRequestCreate) -> models.HiringRequest:
    if hasattr(request, 'model_dump'):
        request_data = request.model_dump()
    else:
        request_data = request

    db_request = models.HiringRequest(**request_data)
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request