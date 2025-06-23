
from sqlalchemy.orm import declarative_base

# This is all we need in this file.
# We are defining a common Base for our SQLAlchemy models to inherit from.
# The engine and session logic will now be handled directly in main.py's lifespan.
Base = declarative_base()