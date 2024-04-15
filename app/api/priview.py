import flet as ft
import websockets
import json
from .controls import ProcessButton, MainButton, ProgressButton


def create_column(data, controls=[]):
    bg_color = data.get('BackgroundColor', None)
    border = data.get('StrokeWidth', None)
    border = ft.border.all(int(border), ft.colors.BLACK12) if border else None
    orientation = ft.CrossAxisAlignment.CENTER if data.get('width') == 'match_parent' else ft.CrossAxisAlignment.START
    padding=ft.Padding(left=0, right=0, top=0, bottom=0)
    return ft.Container(
        ft.Column(controls, horizontal_alignment=orientation, spacing=5), 
        bgcolor=bg_color, 
        border=border, 
        padding=padding, 
        margin=ft.Margin(left=0, right=0, top=0, bottom=5),
        )

def create_row(data, controls=[]):
    bg_color = data.get('BackgroundColor', None)
    border = data.get('StrokeWidth', None)
    border = ft.border.all(int(border), ft.colors.BLACK12) if border else None
    orientation = ft.MainAxisAlignment.CENTER if data.get('width') == 'match_parent' else ft.MainAxisAlignment.START
    padding=ft.Padding(left=0, right=0, top=0, bottom=0)
    return ft.Container(ft.Row(controls=controls, alignment=orientation), bgcolor=bg_color, border=border, padding=padding)

def create_text_view(data):
    text_size_str = data.get('TextSize', "11")
    try:
        text_size = int(text_size_str) if text_size_str.isdigit() else 11 
    except ValueError:
        text_size = 11
    value = data.get('Value', "")
    text_color = data.get('TextColor', ft.colors.BLACK54)
    text_weight = ft.FontWeight.W_600 if data.get('TextBold', False) else ft.FontWeight.NORMAL

    return ft.Text(value, size=text_size, color=text_color, weight=text_weight, max_lines=2, overflow=ft.TextOverflow.ELLIPSIS)

def create_object(data):
    value = data.get('Value', "") + '[object]'
    return ft.Text(value, size=14)

def create_multiline_text(data):
    value = data.get('Value', "") + '[MultilineText]'
    return ft.Text(value, size=14)

def create_picture(data):
    value = data.get('Value', "") + '[Picture]'
    return ft.Text(value, size=14)

def create_button(data):
    value = data.get('Value', "").upper()
    expand = True if data.get('width', 'wrap_content') == 'match_parent' else False
    text_size_str = data.get('TextSize', "14")
    try:
        text_size = int(text_size_str) if text_size_str.isdigit() else 12 
    except ValueError:
        text_size = 12
    
    return MainButton(value, text_size, expand=expand)
    
def create_progress_button(data):
    value = data.get('Value', "")
    return ProgressButton(value)

def create_container(data, control=None):
    return ft.Container(control)

def create_dropdown(data):
    value = data.get('Value', "")
    return ft.Dropdown(
        value,
        options=[
            ft.dropdown.Option(value)
        ],
        focused_bgcolor=ft.colors.RED,
        border=ft.InputBorder.NONE,
        height=40,
        width=150
        )

def create_check_box(data):
    value = data.get('Value', "")
    text_color = data.get('TextColor', "black")
    text_weight = ft.FontWeight.W_600 if data.get('TextBold', False) else ft.FontWeight.NORMAL
    text_italic = data.get('TextItalic', False)
    text_size_str = data.get('TextSize', "14")
    try:
        text_size = int(text_size_str) if text_size_str.isdigit() else 14 
    except ValueError:
        text_size = 14

    return ft.Checkbox(
        height=20,
        label=value, 
        active_color=ft.colors.BLACK, 
        label_style=ft.TextStyle(
            size=text_size, 
            weight=text_weight, 
            italic=text_italic, 
            color=text_color
        )
    )

def render_tiles(data):
    border = data.get('StrokeWidth', None)
    border = ft.border.all(int(border), ft.colors.BLACK12) if border else None
    bg_color = data.get('BackgroundColor', None)
    tiles_elements = data["Elements"]   

    tile_controls = [create_element(element_data) for element_data in tiles_elements if element_data is not None]
    tile_column = ft.Column(controls=tile_controls, spacing=3)

    tile_container = ft.Container(
        content=tile_column,
        bgcolor=bg_color,
        border=border,
        padding=3,
        expand=1
    )
    
    return tile_container

def create_cards_layout(data):
    value = data.get('Value', "")
    text_weight = ft.FontWeight.W_600 if data.get('TextBold', False) else ft.FontWeight.NORMAL
    text_italic = data.get('TextItalic', False) 
    text = ft.Text(value, weight=text_weight, italic=text_italic)
    return ft.Container(ft.Row([ft.Column([ft.Text('CardsLayout:'), text])]), bgcolor=ft.colors.WHITE)

def create_table_layout(data):
    value = data.get('Value', "")
    text_weight = ft.FontWeight.W_600 if data.get('TextBold', False) else ft.FontWeight.NORMAL
    text_italic = data.get('TextItalic', False) 
    text = ft.Text(value, weight=text_weight, italic=text_italic)
    return ft.Container(ft.Row([ft.Column([ft.Text('TableLayout:'), text])]), bgcolor=ft.colors.WHITE)

def render_container_layout(data):
    orientation = data.get("orientation", "vertical").lower()
    elements_data = data.get("Elements", [])

    controls = [create_element(element_data) for element_data in elements_data if element_data is not None]

    if orientation == "vertical":
        return create_column(data, controls)
    else:
        return create_row(data, controls)

def create_edit_text(data):
    value = data.get('Value', "")
    text_color = data.get('TextColor', "black")
    text_weight = ft.FontWeight.W_600 if data.get('TextBold', False) else ft.FontWeight.NORMAL
    text_italic = data.get('TextItalic', False)
    text_size_str = data.get('TextSize', "14")
    width = len(value) * 8 if len(value) > 0 else 24
    height = 40
    try:
        text_size = int(text_size_str) if text_size_str.isdigit() else 14 
    except ValueError:
        text_size = 14
    
    return ft.TextField(
        value, 
        width=width,
        height=height,
        text_size=text_size, 
        color=text_color, 
        border=ft.InputBorder.NONE,
        focused_border_width = 1,
        text_style=ft.TextStyle(weight=text_weight, italic=text_italic),
        )

def create_modern_edit_text(data):
    value = data.get('Value', "")
    label = data.get('Variable', "")
    text_color = data.get('TextColor', "black")
    text_weight = ft.FontWeight.W_600 if data.get('TextBold', False) else ft.FontWeight.NORMAL
    text_italic = data.get('TextItalic', False)
    text_size_str = data.get('TextSize', "14")
    try:
        text_size = int(text_size_str) if text_size_str.isdigit() else 14 
    except ValueError:
        text_size = 14
    
    return ft.Row([ft.TextField(
        value, 
        label=label,
        label_style=ft.TextStyle(size=12, color=ft.colors.BLACK38),
        text_size=text_size, 
        color=text_color, 
        border=ft.InputBorder.NONE,
        focused_border_width = 1,
        text_style=ft.TextStyle(weight=text_weight, italic=text_italic),
        )], alignment=ft.MainAxisAlignment.CENTER)

def create_barcode_fab(value=None):
    return ft.FloatingActionButton(
        bgcolor=ft.colors.ORANGE_800, 
        shape=ft.CircleBorder(),
        content=ft.Text('║║▌║║║', size=12, color=ft.colors.WHITE, style=ft.TextStyle(letter_spacing=-8))
    )

def create_custom_fab(value=None):
    value_mapping = {
        '#f031': {'value': 'A', 'icon': None},
        '#f002': {'value': '', 'icon': ft.icons.SEARCH},
        '#f1de': {'value': '', 'icon': ft.icons.TUNE}  
    }
    config = value_mapping.get(value, {'value': '', 'icon': None})

    content = ft.Text(
        config['value'], 
        size=20, 
        color=ft.colors.WHITE, 
        font_family='Times New Roman'
        ) if config['value'] else ft.Icon(
            config['icon'], 
            color=ft.colors.WHITE, 
            size=24
            )

    return ft.FloatingActionButton(
        bgcolor=ft.colors.ORANGE_800, 
        shape=ft.CircleBorder(),
        content=content 
    )

def create_element(data):
    type_mapping = {
        "TextView": create_text_view,
        "Button": create_button,
        "ProgressButton": create_progress_button,
        "SpinnerLayout": create_dropdown,
        "LinearLayout": render_container_layout,
        "Tiles": render_tiles,
        "CardsLayout": create_cards_layout,
        "TableLayout": create_table_layout,
        "CheckBox": create_check_box,
        "EditTextNumeric": create_edit_text,
        "EditTextText": create_edit_text,
        "ModernEditText": create_modern_edit_text,
        "MultilineText": create_multiline_text,
        "object": create_object,
        "Picture": create_picture
    }

    element_type = data.get("type")
    create_func = type_mapping.get(element_type)

    if create_func:
        return create_func(data)
    elif element_type in ('barcode', 'fab', 'Vision'):
        pass
    else:
        print(f"Неизвестный тип элемента: {element_type}")
        return ft.Text(f"Тут должен быть: {element_type}")

async def render_page(page: ft.Page, elements_data):
    menu_items = []
    fab_list = []
    page.bgcolor = "#f8faf7"
    page.floating_action_button = None
    fab_mapping = {
        "barcode": create_barcode_fab,
        "fab": create_custom_fab,
        "Vision": create_custom_fab
    }
    for element_data in elements_data:
        if element_data.get('type') == 'MenuItem':  
            menu_items.append(ft.PopupMenuItem(text=element_data.get('Value', "")))
        else:
            element = create_element(element_data)
            if element:
                page.add(element)
            element_type = element_data.get("type")    
            fab_func = fab_mapping.get(element_type)
            if fab_func:
                fab_value = element_data.get("Value", "") 
                fab_list.append(fab_func(fab_value))
    
    fab_column = ft.Row(
        [
            ft.Column(
                fab_list, 
                expand=True, 
                alignment=ft.MainAxisAlignment.END, 
                horizontal_alignment=ft.CrossAxisAlignment.END
                )
        ],
        alignment=ft.MainAxisAlignment.END, 
        expand=True
        )
    page.add(fab_column)
    page.appbar = ft.AppBar(
            center_title=False,
            bgcolor="#f8faf7",
            actions=[
                ft.PopupMenuButton(items=menu_items, height=40),
            ],
        )
    page.update()

async def listen_for_updates(page: ft.Page, uri: str):
    render_mapping = {
        'processes_list': _get_processes_list_view,
        'screen_items': render_page,
    }

    async with websockets.connect(uri) as websocket:
        while True:
            data_str = await websocket.recv()
            result = json.loads(data_str)
            action = result.get('action')
            if action == 'screen_items':
                page.clean()
                await render_page(page, result.get('data', {}).get('Elements', []))
            else:
                render_func = render_mapping[action]
                await render_func(page, result.get('data'))  

            page.update()

async def _get_processes_list_view(page: ft.Page, processes_data: dict):
    # Обрабатываем список процессов
    if isinstance(processes_data, list) and all(isinstance(item, str) for item in processes_data):
        list_view = ft.ListView(expand=1, spacing=15, padding=3)
        for btn_title in processes_data:
            list_view.controls.append(ProcessButton(btn_title))
        page.clean()
        page.add(list_view)


