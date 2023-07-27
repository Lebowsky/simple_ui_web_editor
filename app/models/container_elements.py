from typing import List, Optional, Union, Literal

from pydantic import BaseModel, Field

from .elements import BaseElement, DimensionElement, TextElement
from .enums import ElementsIcon, DimensionsType, OrientationType

class ContainerElement(BaseModel):
    value: str = Field(default='', alias='Value')
    variable: str = Field(default='', alias='Variable')
    height: Union[DimensionsType, str] = Field(title='Height')
    width: Union[DimensionsType, str] = Field(title='Width')
    orientation: Optional[OrientationType] = Field(title='Orientation')
    weight: str = Field(default=0, title='Weight')

    text_bold: Optional[bool] = Field(alias='TextBold', title='Text bold')
    text_italic: Optional[bool] = Field(alias='TextItalic', title='Text italic')
    text_size: Optional[str] = Field(alias="TextSize", title='Text size')
    text_color: Optional[str] = Field(alias='TextColor', title='Text color')

class Tabs(ContainerElement):
    type: Literal['Tabs']


class Tab(ContainerElement):
    type: Literal['Tab']


class TextView(ContainerElement):
    type: Literal['TextView']


class Button(ContainerElement):
    type: Literal['Button']


class EditTextText(ContainerElement):
    type: Literal['EditTextText']


class EditTextNumeric(ContainerElement):
    type: Literal['EditTextNumeric']


class EditTextPass(ContainerElement):
    type: Literal['EditTextPass']


class EditTextAuto(ContainerElement):
    type: Literal['EditTextAuto']


class EditTextAutocomplete(ContainerElement):
    type: Literal['EditTextAutocomplete']

    no_refresh: Optional[bool] = Field(alias='NoRefresh')
    show_by_condition: Optional[str]


class ModernEditText(ContainerElement):
    type: Literal['ModernEditText']


class Picture(ContainerElement):
    type: Literal['Picture']


class CheckBox(ContainerElement):
    type: Literal['CheckBox']


class Gauge(ContainerElement):
    type: Literal['Gauge']


class Chart(ContainerElement):
    type: Literal['Chart']


class SpinnerLayout(ContainerElement):
    type: Literal['SpinnerLayout']

    class Config:
        title = 'SpinnerLayout'


class TableLayout(ContainerElement):
    type: Literal['TableLayout']


class MultilineText(ContainerElement):
    type: Literal['MultilineText']


class CardsLayout(ContainerElement):
    type: Literal['CardsLayout']


class CButtons(ContainerElement):
    type: Literal['CButtons']


class CButtonsHorizontal(ContainerElement):
    type: Literal['CButtonsHorizontal']


class DateField(ContainerElement):
    type: Literal['DateField']


class ProgressButton(ContainerElement):
    type: Literal['ProgressButton']


class HTML(ContainerElement):
    type: Literal['html']

    class Config:
        title = 'html'


class Map(ContainerElement):
    type: Literal['map']

    class Config:
        title = 'map'


class File(ContainerElement):
    type: Literal['file']

    class Config:
        title = 'file'


class Object(ContainerElement):
    type: Literal['object']

    class Config:
        title = 'object'
