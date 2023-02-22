from typing import List, Optional
from pydantic import BaseModel, Field

from models.elements import BaseElement, DimensionElement
from models.enums import ElementType


class Container(BaseElement, DimensionElement):
    type: ElementType.linear_layout.value
    BackgroundColor: Optional[str]

    elements: List = Field(default=[], alias='Elements')


class Tiles(BaseElement, DimensionElement):
    type: ElementType.tiles.value

    elements: Optional[List] = Field(alias='Elements')
