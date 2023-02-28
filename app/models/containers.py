from typing import List, Optional, Literal, Union, Annotated
from pydantic import Field

from models.container_elements import Tabs, Tab, TextView, Button, EditTextText, EditTextNumeric, EditTextPass, \
    EditTextAuto, EditTextAutocomplete, ModernEditText, Picture, CheckBox, Gauge, Chart, SpinnerLayout, TableLayout, \
    MultilineText, CardsLayout, CButtons, CButtonsHorizontal, DateField, ProgressButton, HTML, Map, File
from models.elements import BaseElement, DimensionElement, Cart


class Container(BaseElement, DimensionElement):
    type: Literal['LinearLayout']
    BackgroundColor: Optional[str]

    elements: List['Element'] = Field(default=[], alias='Elements')

    class Config:
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

    ], Field(discriminator='type')
]

Container.update_forward_refs(Element=Element)
Tiles.update_forward_refs(Element=Element)
