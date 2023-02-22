from typing import Literal

from enum import Enum


class ElementType(Enum):
    linear_layout = Literal['LinearLayout']
    barcode = Literal['barcode']
    horizontal_gallery = Literal['HorizontalGallery']
    voice = Literal['voice']
    photo = Literal['photo']
    photo_gallery = Literal['photoGallery']
    signature = Literal['signature']
    vision = Literal['Vision']
    cart = Literal['Cart']
    tiles = Literal['Tiles']
    image_slider = Literal['ImageSlider']
    menu_item = Literal['MenuItem']


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


class CVDetectorType(str, Enum):
    barcode: str = 'Barcode'
    ocr: str = 'OCR'
    objects_full: str = 'Objects_Full'
    objects_ocr: str = 'Objects_OCR'
    objects_barcode: str = 'Objects_Barcode'
    objects_f1: str = 'Objects_f1'