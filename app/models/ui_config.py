from typing import Optional, Union, List, Dict

from enum import Enum

from pydantic import BaseModel, root_validator, create_model


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


class Tab:
    def __init__(self, field):
        self.tabs = {
            'common': {
                'title': 'Common',
                'items': [
                    'type',
                    'Value',
                    'Variable',
                    'height',
                    'width',
                    'weight',
                    'orientation',
                    'gravity_horizontal',
                    'gravity_vertical',
                ],
                'ordering': 1
            },
            'others': {
                'title': 'Other',
                'items': [
                    'BackgroundColor',
                    'StrokeWidth',
                    'Padding',
                    'TextSize',
                    'TextColor',
                    'TextBold',
                    'TextItalic',
                ],
                'ordering': 4
            },
            'elements': {
                'title': 'Elements',
                'items': ['Elements'],
                'ordering': 5
            },
            'handlers': {
                'title': 'Handlers',
                'items': ['Handlers'],
                'ordering': 6
            }
        }
        self.name = self.get_field_tab(field)
        self.title = self.tabs[self.name].get('title', 'Other')
        self.ordering = self.tabs[self.name].get('ordering', 0)

    def get_field_tab(self, field, default='common'):
        tab_name = default
        for tab, value in self.tabs.items():
            if field in value['items']:
                tab_name = tab
                break

        return tab_name


class FieldType(Enum):
    text = 'text'
    select = 'select'
    checkbox = 'checkbox'
    operations = 'operations'
    elements = 'elements'
    handlers = 'handlers'
    file='file'


class ElementType(BaseModel):
    parent: str
    type: FieldType
    options: Optional[List[str]]
    text: str
    tab_name: str = ''

    class Config:
        use_enum_values = True


class BaseField(BaseModel):
    type: FieldType
    options: Optional[List[str]]
    default_value: Optional[Union[bool, str]]
    tab_name: str = ''
    text: str
    required: bool = False
    description: str = ''
    hidden: bool = False

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
        elif values['title'] == 'file_path':
            values['type'] = FieldType.file
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
    type_: Optional[List[ElementType]] = []
    tabs: Dict = {}

    @root_validator
    def fill_values(cls, values: dict):
        for key, value in values.items():
            if isinstance(value, BaseField):
                tab = Tab(key)
                value.tab_name = tab.name
                if tab.name not in [key for key in values['tabs']]:
                    values['tabs'][tab.name] = {
                        'title': tab.title,
                        'ordering': tab.ordering
                    }

        return values

    class Config:
        use_enum_values = True
