from typing import List, Optional, Union

from pydantic import BaseModel, Field, validator, root_validator

from models.enums import ElementType, ContainerElementType, ElementsIcon, GravityEnum, DimensionsType, OrientationType


class BaseElement(BaseModel):
    type: ElementType
    value: str = Field(default='', alias='Value')
    variable: str = Field(default='', alias='Variable')

    class Config:
        use_enum_values = True


class DimensionElement(BaseModel):
    height: Optional[Union[DimensionsType, str]]
    width: Optional[Union[DimensionsType, str]]
    weight: Optional[str]
    height_value: Optional[str]
    width_value: Optional[str]
    gravity_horizontal: Optional[GravityEnum]
    padding: Optional[str] = Field(alias='Padding')
    stroke_width: Optional[str] = Field(alias='StrokeWidth')
    orientation: Optional[OrientationType]


class Barcode(BaseElement):
    type: ElementType.barcode.value


class HorizontalGallery(BaseElement):
    type: ElementType.horizontal_gallery.value


class Voice(BaseElement):
    type: ElementType.voice.value


class Photo(BaseElement):
    type: ElementType.photo.value


class PhotoGallery(BaseElement):
    type: ElementType.photo_gallery.value


class Signature(BaseElement):
    type: ElementType.signature.value


class Vision(BaseElement):
    type: ElementType.vision.value


class Cart(BaseElement):
    type: ElementType.cart.value


class ImageSlider(BaseElement):
    type: ElementType.image_slider.value


class MenuItem(BaseElement):
    type: ElementType.menu_item.value


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

    # @validator('background_color')
    # def check_color(cls, v: str):
    #     if not isinstance(v, str) or not v.upper().startswith('#'):
    #         raise ValueError('Color must start with "#"')
    #     return v

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
