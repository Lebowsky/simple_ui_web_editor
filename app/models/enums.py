from typing import Literal

from enum import Enum


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


class CVDetectorType(str, Enum):
    barcode: str = 'Barcode'
    ocr: str = 'OCR'
    objects_full: str = 'Objects_Full'
    objects_ocr: str = 'Objects_OCR'
    objects_barcode: str = 'Objects_Barcode'
    objects_f1: str = 'Objects_f1'