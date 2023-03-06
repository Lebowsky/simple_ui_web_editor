from typing import Optional

from pydantic import BaseModel


class BaseHandler(BaseModel):
    type: str
    action: str
    event: str
    method: str
    postExecute: str

    class Config:
        use_enum_values = True
        title = 'Handlers'


class CommonHandler(BaseHandler):
    alias: str


class Handler(BaseHandler):
    listener: Optional[str]
