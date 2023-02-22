from typing import List, Optional, Union, Literal

from pydantic import BaseModel, Field

from models.enums import GravityEnum, DimensionsType, OrientationType


class BaseElement(BaseModel):
    type: str
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

    background_color: Optional[str] = Field(alias='BackgroundColor')


class TextElement(BaseModel):
    text_size: Optional[str] = Field(alias="TextSize")
    text_color: Optional[str] = Field(alias='TextColor')
    text_bold: Optional[bool] = Field(alias='TextBold')
    text_italic: Optional[bool] = Field(alias='TextItalic')


class Barcode(BaseElement):
    type: Literal['barcode']


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
