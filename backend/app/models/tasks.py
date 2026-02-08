from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from .database import Base


class Space(Base):
    __tablename__ = 'spaces'
    uuid = Column(String, primary_key=True, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey('users.id'), nullable=False)

class Task(Base):
    __tablename__ = 'tasks'
    id = Column(Integer, primary_key=True, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    completed = Column(Boolean, default=False)
    author_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    space_uuid = Column(String, ForeignKey('spaces.uuid'), nullable=False)
    