from pydantic import BaseModel


class Task(BaseModel):
    id: int
    title: str
    description: str
    completed: bool = False
    author_id: int
    space_uuid: str

class Space(BaseModel):
    name: str
    owner_id: int
    uuid: str
    tasks: list[Task] = []

class SpaceCreate(BaseModel):
    name: str

class CreateTask(BaseModel):
    title: str
    description: str
    space_uuid: str

class EditTask(BaseModel):
    id: int
    space_uuid: str
    title: str
    description: str
    completed: bool
    