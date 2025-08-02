"""
Production-ready database types that work with both PostgreSQL and SQLite
Uses JSON columns for array-like data for maximum compatibility
"""

from sqlalchemy import TypeDecorator, Text, String
from sqlalchemy.dialects.postgresql import ARRAY as PG_ARRAY, UUID as PG_UUID
from sqlalchemy.dialects.sqlite import TEXT as SQLITE_TEXT
import json
import uuid
from typing import List, Any, Optional


class JSONList(TypeDecorator):
    """
    A type that can be used for storing lists as JSON strings
    Compatible with both PostgreSQL and SQLite
    """
    impl = Text
    cache_ok = True

    def process_bind_param(self, value: Optional[List[Any]], dialect) -> Optional[str]:
        """Convert Python list to JSON string for storage"""
        if value is None:
            return None
        if not isinstance(value, list):
            value = []
        return json.dumps(value)

    def process_result_value(self, value: Optional[str], dialect) -> List[Any]:
        """Convert JSON string back to Python list"""
        if value is None:
            return []
        try:
            result = json.loads(value)
            return result if isinstance(result, list) else []
        except (json.JSONDecodeError, TypeError):
            return []


class JSONDict(TypeDecorator):
    """
    A type that can be used for storing dictionaries as JSON strings
    Compatible with both PostgreSQL and SQLite
    """
    impl = Text
    cache_ok = True

    def process_bind_param(self, value: Optional[dict], dialect) -> Optional[str]:
        """Convert Python dict to JSON string for storage"""
        if value is None:
            return None
        if not isinstance(value, dict):
            value = {}
        return json.dumps(value)

    def process_result_value(self, value: Optional[str], dialect) -> dict:
        """Convert JSON string back to Python dict"""
        if value is None:
            return {}
        try:
            result = json.loads(value)
            return result if isinstance(result, dict) else {}
        except (json.JSONDecodeError, TypeError):
            return {}


class UniversalUUID(TypeDecorator):
    """
    A UUID type that works with both PostgreSQL UUID and SQLite TEXT
    """
    impl = String
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        else:
            return dialect.type_descriptor(String(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, uuid.UUID):
            return str(value) if dialect.name != 'postgresql' else value
        if isinstance(value, str):
            return value
        return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, uuid.UUID):
            return value
        return uuid.UUID(value) if value else None


# Utility functions for array operations
def add_to_json_list(current_value: Optional[List[Any]], new_item: Any) -> List[Any]:
    """Add an item to a JSON list column"""
    if current_value is None:
        current_value = []
    if new_item not in current_value:
        current_value.append(new_item)
    return current_value


def remove_from_json_list(current_value: Optional[List[Any]], item_to_remove: Any) -> List[Any]:
    """Remove an item from a JSON list column"""
    if current_value is None:
        return []
    try:
        current_value.remove(item_to_remove)
    except ValueError:
        pass  # Item not in list
    return current_value


def update_json_dict(current_value: Optional[dict], updates: dict) -> dict:
    """Update a JSON dict column with new values"""
    if current_value is None:
        current_value = {}
    current_value.update(updates)
    return current_value