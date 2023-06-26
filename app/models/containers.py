from typing import List, Optional, Literal, Union, Annotated
from pydantic import Field, BaseModel

from .container_elements import Tabs, Tab, TextView, Button, EditTextText, EditTextNumeric, EditTextPass, \
    EditTextAuto, EditTextAutocomplete, ModernEditText, Picture, CheckBox, Gauge, Chart, SpinnerLayout, TableLayout, \
    MultilineText, CardsLayout, CButtons, CButtonsHorizontal, DateField, ProgressButton, HTML, Map, File, Object
from .elements import BaseElement, DimensionElement, Cart


class Container(DimensionElement):
    type: Literal['LinearLayout']
    variable: str = Field(default='', alias='Variable')
    elements: List['Element'] = Field(default=[], alias='Elements')

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
        Container,
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

Container.update_forward_refs(Element=Element)
Tiles.update_forward_refs(Element=Element)
