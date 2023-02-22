from typing import List, Optional, Union, Literal

from pydantic import BaseModel, Field

from models.elements import BaseElement, DimensionElement, TextElement
from models.enums import ElementsIcon


class Tabs(BaseElement, DimensionElement, TextElement):
    type: Literal['Tabs']


class Tab(BaseElement, DimensionElement, TextElement):
    type: Literal['Tab']


class TextView(BaseElement, DimensionElement, TextElement):
    type: Literal['TextView']

    drawable: Optional[ElementsIcon]


class Button(BaseElement, DimensionElement, TextElement):
    type: Literal['Button']


class EditTextText(BaseElement, DimensionElement, TextElement):
    type: Literal['EditTextText']


class EditTextNumeric(BaseElement, DimensionElement, TextElement):
    type: Literal['EditTextNumeric']


class EditTextPass(BaseElement, DimensionElement, TextElement):
    type: Literal['EditTextPass']


class EditTextAuto(BaseElement, DimensionElement, TextElement):
    type: Literal['EditTextAuto']


class EditTextAutocomplete(BaseElement, DimensionElement, TextElement):
    type: Literal['EditTextAutocomplete']

    no_refresh: Optional[bool] = Field(alias='NoRefresh')
    show_by_condition: Optional[str]


class ModernEditText(BaseElement, DimensionElement, TextElement):
    type: Literal['ModernEditText']


class Picture(BaseElement, DimensionElement, TextElement):
    type: Literal['Picture']


class CheckBox(BaseElement, DimensionElement, TextElement):
    type: Literal['CheckBox']


class Gauge(BaseElement, DimensionElement, TextElement):
    type: Literal['Gauge']


class Chart(BaseElement, DimensionElement, TextElement):
    type: Literal['Chart']


class SpinnerLayout(BaseElement, DimensionElement, TextElement):
    type: Literal['SpinnerLayout']


class TableLayout(BaseElement, DimensionElement, TextElement):
    type: Literal['TableLayout']


class MultilineText(BaseElement, DimensionElement, TextElement):
    type: Literal['MultilineText']


class CardsLayout(BaseElement, DimensionElement, TextElement):
    type: Literal['CardsLayout']


class CButtons(BaseElement, DimensionElement, TextElement):
    type: Literal['CButtons']


class CButtonsHorizontal(BaseElement, DimensionElement, TextElement):
    type: Literal['CButtonsHorizontal']


class DateField(BaseElement, DimensionElement, TextElement):
    type: Literal['DateField']


class ProgressButton(BaseElement, DimensionElement, TextElement):
    type: Literal['ProgressButton']


class HTML(BaseElement, DimensionElement, TextElement):
    type: Literal['html']


class Map(BaseElement, DimensionElement, TextElement):
    type: Literal['map']


class File(BaseElement, DimensionElement, TextElement):
    type: Literal['file']
