from enum import Enum


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