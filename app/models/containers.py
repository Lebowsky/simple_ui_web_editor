from typing import List, Optional, Literal, Union, Annotated
from pydantic import Field, BaseModel

from .container_elements import Tabs, Tab, TextView, Button, EditTextText, EditTextNumeric, EditTextPass, \
    EditTextAuto, EditTextAutocomplete, ModernEditText, Picture, CheckBox, Gauge, Chart, SpinnerLayout, TableLayout, \
    MultilineText, CardsLayout, CButtons, CButtonsHorizontal, DateField, ProgressButton, HTML, Map, File, Object
from .elements import BaseElement, DimensionElement, Cart, LayoutElement


class LinearLayout(LayoutElement):
    type: Literal['LinearLayout']
    variable: str = Field(default='', alias='Variable')
    value: str = Field(default='', alias='Value')

    elements: List['Element'] = Field(default=[], alias='Elements')

    background_color: Optional[str] = Field(alias='BackgroundColor')
    stroke_width: Optional[str] = Field(alias='StrokeWidth')
    padding: Optional[str] = Field(alias='Padding')
    class Config:
        use_enum_values = True
        title = 'LinearLayout'


class Tiles(BaseElement, DimensionElement):
    type: Literal['Tiles']

    elements: Optional[List['Element']] = Field(alias='Elements')

    class Config:
        title = 'Tiles'


Element = Annotated[
    Union[
        LinearLayout,
        Tabs,
        Tab,
        TextView,
        Button,
        EditTextText,
        EditTextNumeric,
        EditTextPass,
        EditTextAuto,
        EditTextAutocomplete,
        ModernEditText,
        Picture,
        CheckBox,
        Gauge,
        Chart,
        SpinnerLayout,
        TableLayout,
        Cart,
        MultilineText,
        CardsLayout,
        CButtons,
        CButtonsHorizontal,
        DateField,
        ProgressButton,
        HTML,
        Map,
        File,
        Object
    ], Field(discriminator='type')
]

LinearLayout.update_forward_refs(Element=Element)
Tiles.update_forward_refs(Element=Element)
