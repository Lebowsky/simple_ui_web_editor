from typing import List, Optional, Literal, Union, Annotated
from pydantic import Field, BaseModel

from .container_elements import Tabs, Tab, TextView, Button, EditTextText, EditTextNumeric, EditTextPass, \
    EditTextAuto, EditTextAutocomplete, ModernEditText, Picture, CheckBox, Gauge, Chart, SpinnerLayout, TableLayout, \
    MultilineText, CardsLayout, CButtons, CButtonsHorizontal, DateField, ProgressButton, HTML, Map, File, Object
from .elements import BaseElement, DimensionElement, Cart, LayoutElement, OrientationType, DimensionsType


class LinearLayout(BaseModel):
    type: Literal['LinearLayout']
    variable: str = Field(default='', alias='Variable')
    orientation: OrientationType = Field(default='vertical', title='Orientation')
    height: Union[DimensionsType, str] = Field(title='Height')
    width: Union[DimensionsType, str] = Field(title='Width')
    weight: str = Field(default=0, title='Weight')

    elements: List['Element'] = Field(default=[], alias='Elements')

    background_color: Optional[str] = Field(alias='BackgroundColor', title='Background color')
    stroke_width: Optional[str] = Field(alias='StrokeWidth', title='Stroke width')
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
