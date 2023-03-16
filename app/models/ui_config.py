from typing import Optional, Union, List, Any

from enum import Enum

from pydantic import BaseModel, validator, root_validator, create_model


def get_any_of_elements(any_of: List):
    result = []
    for item in any_of:
        if item.get('enum'):
            result.extend(item['enum'])

    return result


def create_element(title, fields):
    return create_model(title, __base__=BaseElement, **fields)()


def convert_to_dict(value):
    return create_model('result', **value)().dict(exclude_none=True)


class FieldType(Enum):
    text = 'text'
    select = 'select'
    checkbox = 'checkbox'
    operations = 'operations'
    elements = 'elements'
    handlers = 'handlers'


class ElementType(BaseModel):
    parent: str
    type: FieldType
    options: Optional[List[str]]
    text: str

    class Config:
        use_enum_values = True


class BaseField(BaseModel):
    type: FieldType
    options: Optional[List[str]]
    default_value: Optional[Union[bool, str]]
    text: str
    required: bool = False

    @root_validator(pre=True)
    def fill_values(cls, values):
        if values.get('allOf'):
            text = values['text']
            values = values['allOf'][0]
            values['text'] = text
        if values.get('anyOf'):
            values['type'] = FieldType.select
            values['options'] = get_any_of_elements(values['anyOf'])
        elif values.get('enum'):
            values['type'] = FieldType.select
            values['options'] = values['enum']

        elif values['title'] in ['Operations', 'Elements', 'Handlers']:
            values['type'] = values['title'].lower()
        elif values['type'] == 'boolean':
            values['type'] = FieldType.checkbox
            values['default_value'] = False
        else:
            values['type'] = FieldType.text
            values['default_value'] = ''

        return values

    class Config:
        use_enum_values = True


class BaseElement(BaseModel):
    type: Optional[List[ElementType]] = []

    @root_validator
    def fill_values(cls, values: dict):
        if values.get('type'):
            values.pop('type')

        return values

    class Config:
        use_enum_values = True
