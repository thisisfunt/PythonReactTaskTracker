from models.database import SessionLocal
from models.tasks import Task, Space
import uuid


def createSpace(name: str, owner_id: int):
    with SessionLocal() as session:
        space = Space(name=name, owner_id=owner_id, uuid=str(uuid.uuid4()))
        session.add(space)
        session.commit()
        session.refresh(space)
        return space

def getSpaceByUUID(space_uuid: str):
    with SessionLocal() as session:
        return session.query(Space).filter_by(uuid=space_uuid).first()


def createTask(title: str, description: str, author_id: int, space_uuid: str):
    with SessionLocal() as session:
        space = session.query(Space).filter_by(uuid=space_uuid).first()
        if not space:
            raise ValueError("Space not found")
        task = Task(title=title, description=description, author_id=author_id, space_uuid=space.uuid)
        session.add(task)
        session.commit()
        session.refresh(task)
        return task

def getSpacesByOwner(owner_id: int):
    with SessionLocal() as session:
        spaces = session.query(Space).filter_by(owner_id=owner_id).all()
        return spaces

def getTasksBySpace(space_uuid: str):
    with SessionLocal() as session:
        tasks = session.query(Task).filter_by(space_uuid=space_uuid).all()
        return tasks

def editTask(task_id: int, space_uuid: str, title: str, description: str, completed: bool):
    with SessionLocal() as session:
        task = session.query(Task).filter_by(id=task_id, space_uuid=space_uuid).first()
        if not task:
            raise ValueError("Task not found")
        task.title = title
        task.description = description
        task.completed = completed
        session.commit()
        session.refresh(task)
        return task

def deleteTask(task_id: int, space_uuid: str):
    with SessionLocal() as session:
        task = session.query(Task).filter_by(id=task_id, space_uuid=space_uuid).first()
        if not task:
            raise ValueError("Task not found")
        session.delete(task)
        session.commit()