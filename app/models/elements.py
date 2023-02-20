from typing import List, Optional, Union, Any
from enum import Enum

from pydantic import BaseModel, Field, validator, root_validator


class ElementType(str, Enum):
    linear_layout: str = 'LinearLayout'
    barcode: str = 'barcode'
    horizontal_gallery: str = 'HorizontalGallery'
    voice: str = 'voice'
    photo: str = 'photo'
    photo_gallery: str = 'photoGallery'
    signature: str = 'signature'
    vision: str = 'Vision'
    cart: str = 'Cart'
    tiles: str = 'Tiles'
    image_slider: str = 'ImageSlider'
    menu_item: str = 'MenuItem'


class ContainerElementType(str, Enum):
    text_view: str = 'TextView'
    button: str = 'Button'
    edit_text_text: str = 'EditTextText'
    edit_text_numeric: str = 'EditTextNumeric'
    edit_text_pass: str = 'EditTextPass'
    edit_text_auto: str = 'EditTextAuto'
    edit_text_autocomplete: str = 'EditTextAutocomplete'
    modern_edit_text: str = 'ModernEditText'
    picture: str = 'Picture'
    check_box: str = 'CheckBox'
    gauge: str = 'Gauge'
    chart: str = 'Chart'
    spinner_layout: str = 'SpinnerLayout'
    table_layout: str = 'TableLayout'
    cart: str = 'Cart'
    multiline_text: str = 'MultilineText'
    cards_layout: str = 'CardsLayout'
    c_buttons: str = 'CButtons'
    c_buttons_horizontal: str = 'CButtonsHorizontal'
    date_field: str = 'DateField'
    progress_button: str = 'ProgressButton'
    html: str = 'html'
    map: str = 'map'


class ElementsIcon(str, Enum):
    forward: str = 'forward'
    backward: str = 'backward'
    run: str = 'run'
    cancel: str = 'cancel'
    edit: str = 'edit'
    picture: str = 'picture'
    info: str = 'info'
    settings: str = 'settings'
    plus: str = 'plus'
    save: str = 'save'
    search: str = 'search'
    send: str = 'send'
    done: str = 'done'


class GravityEnum(str, Enum):
    left: str = "left"
    right: str = 'right'
    center: str = 'center'


class DimensionsType(str, Enum):
    wrap_content: str = 'wrap_content'
    match_parent: str = 'match_parent'


class OrientationType(str, Enum):
    vertical = 'vertical'
    horizontal = 'horizontal'


class BaseElement(BaseModel):
    type: ElementType
    value: str = Field(default='', alias='Value')
    variable: str = Field(default='', alias='Variable')

    class Config:
        use_enum_values = True


class BaseContainerElement(BaseElement):
    type: ContainerElementType

    height: Union[DimensionsType, str] = DimensionsType.wrap_content
    width: Union[DimensionsType, str] = DimensionsType.wrap_content
    weight: str = '0'
    height_value: Optional[str]
    width_value: Optional[str]
    gravity_horizontal: Optional[GravityEnum]

    text_size: str = Field(default='', alias="TextSize")
    text_color = Field(default='', alias='TextColor')
    text_bold: bool = Field(default=False, alias='TextBold')
    text_italic: bool = Field(default=False, alias='TextItalic')

    drawable: ElementsIcon = None
    number_precision = Field(default=0, alias="NumberPrecision")
    background_color = Field(default='', alias='BackgroundColor')


    @validator('background_color')
    def check_color(cls, v: str):
        if not isinstance(v, str) or not v.upper().startswith('#F'):
            raise ValueError('Color must start with "#F"')
        return v

    @validator('weight', 'text_size', 'height_value', 'width_value')
    def check_int_value(cls, v):
        try:
            int(v)
        except Exception:
            raise ValueError('Value must be int')
        return v

    @root_validator
    def check_dimensions(cls, values):
        for key in ['height', 'width']:
            if not isinstance(values.get(key, None), DimensionsType) and not values.get('width_value', None):
                values[f'{key}_value'] = values.get(key, None)
        return values


class RootContainer(BaseElement):
    type: ElementType = ElementType.linear_layout
    height: DimensionsType = DimensionsType.wrap_content
    width: DimensionsType = DimensionsType.wrap_content
    weight: str = '0'
    orientation: OrientationType = OrientationType.horizontal
    elements: List[Union['RootContainer', BaseContainerElement]] = Field(default=[], alias='Elements')
    background_color: Optional[str] = Field(default='', alias='BackgroundColor')
    stroke_width: Optional[str] = Field(default='', alias='StrokeWidth')
    padding: Optional[str] = Field(default='', alias='Padding')

    @validator('weight')
    def check_int_value(cls, v):
        try:
            int(v)
        except Exception:
            raise ValueError('Value must be int')
        return v
