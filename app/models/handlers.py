from typing import Optional

from pydantic import BaseModel, Field, validator, root_validator

from .enums import EventCommonHandlerEnum, EventHandlerEnum, ActionHandlerEnum, HandlerType, EventCVHandlerEnum


class BaseHandler(BaseModel):
    event: str
    listener: str = ''
    action: ActionHandlerEnum = Field(title='Action')
    type: HandlerType = Field(alias='type', title='Type')
    method: str = Field(title='Method')
    postExecute: str = Field(default='', title='Post execute')

    class Config:
        use_enum_values = True

    @root_validator(pre=True)
    def fill_type_pre(cls, values):
        return values


class CommonHandler(BaseHandler):
    alias: Optional[str]
    event: Optional[EventCommonHandlerEnum] = Field(title='Event')

    class Config:
        title = 'CommonHandler'


class Handler(BaseHandler):
    event: EventHandlerEnum = Field(title='Event')

    class Config:
        title = 'Handler'


class CVHandler(BaseHandler):
    event: EventCVHandlerEnum = Field(title='Event')
