from typing import Optional

from pydantic import BaseModel, Field, validator, root_validator

from .enums import EventCommonHandlerEnum, EventHandlerEnum, ActionHandlerEnum, HandlerType, EventCVHandlerEnum


class BaseHandler(BaseModel):
    event: str
    listener: Optional[str]
    action: ActionHandlerEnum = Field(title='Action')
    type_: Optional[HandlerType] = Field(alias='Type', title='Type')
    type: HandlerType = Field(alias='type')
    method: str = Field(title='Method')
    postExecute: str = Field(default='', title='Post execute')

    class Config:
        use_enum_values = True

    @root_validator(pre=True)
    def fill_type_pre(cls, values):
        if values.get('Type'):
            values['type'] = values['Type']
            values['Type'] = None
        return values


class CommonHandler(BaseHandler):
    alias: str
    event: EventCommonHandlerEnum = Field(title='Event')

    class Config:
        title = 'CommonHandler'


class Handler(BaseHandler):
    event: EventHandlerEnum = Field(title='Event')

    class Config:
        title = 'Handler'


class CVHandler(BaseHandler):
    event: EventCVHandlerEnum = Field(title='Event')
