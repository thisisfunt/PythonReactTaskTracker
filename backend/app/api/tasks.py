from fastapi.routing import APIRouter
from fastapi import Depends, Header, HTTPException
from schemas.tasks import EditTask, Task, Space, SpaceCreate, CreateTask
from services.tasks import createSpace, deleteTask, editTask, getSpaceByUUID, createTask, getSpacesByOwner, getTasksBySpace
from services.users import decode_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging

task_router = APIRouter(prefix="/tasks")
space_router = APIRouter(prefix="/spaces")
security = HTTPBearer()
logging.basicConfig(level=logging.INFO)


@space_router.get("/me")
def get_my_spaces(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        id = decode_token(token)["id"]
        spaces = getSpacesByOwner(id)
        res = []
        for space in spaces:
            _space = Space(name=space.name, owner_id=space.owner_id, uuid=space.uuid)
            tasks = getTasksBySpace(space.uuid)
            _space.tasks = [Task(id=task.id, title=task.title, description=task.description, completed=task.completed, author_id=task.author_id, space_uuid=task.space_uuid) for task in tasks]
            res.append(_space)
        return res
    except ValueError as e:
        logging.error("Invalid token")
        raise HTTPException(status_code=401, detail="Invalid token")

@space_router.get("/{space_uuid}")
def get_space(space_uuid: str):
    space = getSpaceByUUID(space_uuid)
    if not space:
        return []
    tasks = getTasksBySpace(space.uuid)
    return Space(name=space.name, owner_id=space.owner_id, uuid=space.uuid, tasks=[Task(id=task.id, title=task.title, description=task.description, completed=task.completed, author_id=task.author_id, space_uuid=task.space_uuid) for task in tasks])

@space_router.post("/")
def create_space(create_space: SpaceCreate, credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = decode_token(token)
        new_space = createSpace(create_space.name, payload["id"])
        return Space(name=new_space.name, owner_id=new_space.owner_id, uuid=new_space.uuid, tasks=[])
    except ValueError as e:
        raise HTTPException(status_code=401, detail="Invalid token")

@task_router.post("/")
def create_task(task: CreateTask, credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = decode_token(token)
        createTask(task.title, task.description, payload["id"], task.space_uuid)
        return {"message": "Task created successfully"}
    except ValueError as e:
        raise HTTPException(status_code=401, detail="Invalid token")


@task_router.patch("")
def edit_task(task: EditTask, credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = decode_token(token)
        editTask(task.id, task.space_uuid, task.title, task.description, task.completed)
        return {"message": "Task updated successfully"}
    except ValueError as e:
        raise HTTPException(status_code=401, detail="Invalid token")

@task_router.delete("/{task_id}")
def delete_task(task_id: int, space_uuid: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = decode_token(token)
        deleteTask(task_id, space_uuid)
        return {"message": "Task deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=401, detail="Invalid token")