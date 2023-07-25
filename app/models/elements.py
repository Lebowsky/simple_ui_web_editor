from typing import List, Optional, Union, Literal

from pydantic import BaseModel, Field

from .enums import GravityHorizontalEnum, DimensionsType, OrientationType, GravityVerticalEnum


class BaseElement(BaseModel):
    type: str
    value: str = Field(default='', alias='Value')
    variable: str = Field(default='', alias='Variable')
    style_name: Optional[str]

    class Config:
        use_enum_values = True


class DimensionElement(BaseModel):
    background_color: Optional[str] = Field(alias='BackgroundColor', title='Background color')
    stroke_width: Optional[str] = Field(alias='StrokeWidth', title='Stroke width')
    padding: Optional[str] = Field(alias='Padding')
    orientation: Optional[OrientationType] = Field(title='Orientation')
    height: Optional[Union[DimensionsType, str]] = Field(title='Height')
    width: Optional[Union[DimensionsType, str]] = Field(title='Width')
    gravity_horizontal: Optional[GravityHorizontalEnum] = Field(title='Gravity horizontal')
    gravity_vertical: Optional[GravityVerticalEnum] = Field(title='Vertical gravity')
    weight: Optional[str] = Field(default=0, title='Weight')
    height_value: Optional[str]
    width_value: Optional[str]


class LayoutElement(BaseModel):
    orientation: Optional[OrientationType] = Field(title='Orientation')
    height: Optional[Union[DimensionsType, str]] = Field(title='Height')
    width: Optional[Union[DimensionsType, str]] = Field(title='Width')
    weight: Optional[str] = Field(default=0, title='Weight')
    height_value: Optional[str]
    width_value: Optional[str]


class TextElement(BaseModel):
    text_size: Optional[str] = Field(alias="TextSize")
    text_color: Optional[str] = Field(alias='TextColor')
    text_bold: Optional[bool] = Field(alias='TextBold')
    text_italic: Optional[bool] = Field(alias='TextItalic')


class Barcode(BaseElement):
    type: Literal['barcode']

    class Config:
        title = 'barcode'


class HorizontalGallery(BaseElement):
    type: Literal['HorizontalGallery']


class Voice(BaseElement):
    type: Literal['voice']


class Photo(BaseElement):
    type: Literal['photo']


class PhotoGallery(BaseElement):
    type: Literal['photoGallery']


class Signature(BaseElement):
    type: Literal['signature']


class Vision(BaseElement):
    type: Literal['Vision']


class Cart(BaseElement, DimensionElement):
    type: Literal['Cart']


class ImageSlider(BaseElement):
    type: Literal['ImageSlider']


class MenuItem(BaseElement):
    type: Literal['MenuItem']


class Fab(BaseElement):
    type: Literal['fab']
