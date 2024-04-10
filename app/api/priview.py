import flet as ft
import websockets
import json
from .controls import ProcessButton, MainButton, ProgressButton, DocumentFilterHeader, FirstLineCard, DocumentCard


def create_column(data, controls=[]):
    bg_color = data.get('BackgroundColor', None)
    border = data.get('StrokeWidth', None)
    border = ft.border.all(int(border), ft.colors.BLACK12) if border else None
    orientation = ft.CrossAxisAlignment.CENTER if data.get('width') == 'match_parent' else ft.CrossAxisAlignment.START
    padding=ft.Padding(left=0, right=0, top=0, bottom=0)
    return ft.Container(ft.Column(controls, horizontal_alignment=orientation), bgcolor=bg_color, border=border, padding=padding)

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

    return ft.Text(value, size=text_size, color=text_color, weight=text_weight)

def create_button(data):
    text_size_str = data.get('TextSize', "14")
    try:
        text_size = int(text_size_str) if text_size_str.isdigit() else 14 
    except ValueError:
        text_size = 14
    value = data.get('Value', "")
    return MainButton(value, text_size)
    
def create_progress_button(data):
    value = data.get('Value', "")
    return ProgressButton(value)

def create_container(data, control=None):
    return ft.Container(control)

def create_dropdown(data):
    value = data.get('Value', "")
    return ft.Dropdown(value)

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
        input_filter=ft.InputFilter(allow=True, regex_string=r"[0-9]", replacement_string=""),
        text_style=ft.TextStyle(weight=text_weight, italic=text_italic),
        )

def create_element(data):
    type_mapping = {
        "TextView": create_text_view,
        "Button": create_button,
        "ProgressButton": create_progress_button,
        "SpinnerLayout": create_dropdown,
        "LinearLayout": render_container_layout,
        "Tiles": render_tiles,
        "CheckBox": create_check_box,
        "EditTextNumeric": create_edit_text
    }

    element_type = data.get("type")
    create_func = type_mapping.get(element_type)

    if create_func:
        return create_func(data)
    else:
        print(f"Неизвестный тип элемента: {element_type}")
        return ft.Text(f"Тут должен быть: {element_type}")

def render_tiles(data):
    border = data.get('StrokeWidth', None)
    border = ft.border.all(int(border), ft.colors.BLACK12) if border else None
    bg_color = data.get('BackgroundColor', None)
    tiles_elements = data["Elements"]   

    # Для каждого элемента в tiles_elements создаем Row с Text и добавляем его в список tile_controls
    tile_controls = [create_element(element_data) for element_data in tiles_elements if element_data is not None]

    # Используем tile_controls для создания Column
    tile_column = ft.Column(controls=tile_controls, spacing=3)

    tile_container = ft.Container(
        content=tile_column,
        bgcolor=bg_color,
        border=border,
        padding=3,
        expand=1
    )
    
    return tile_container

def render_container_layout(data):
    orientation = data.get("orientation", "vertical").lower()
    elements_data = data.get("Elements", [])

    controls = [create_element(element_data) for element_data in elements_data if element_data is not None]

    if orientation == "vertical":
        return create_column(data, controls)
    else:
        return create_row(data, controls)

async def render_page(page: ft.Page, elements_data):
    page.bgcolor = "#f8faf7"
    for element_data in elements_data:
        element = create_element(element_data)
        if element:
            page.add(element)
    page.update()


async def listen_for_updates(page: ft.Page, uri: str):
    render_mapping = {
        'processes_list': _get_processes_list_view,
        'screen_items': render_page,
        'screen_documents': _get_documents_list_view 
    }

    async with websockets.connect(uri) as websocket:
        while True:
            data_str = await websocket.recv()
            result = json.loads(data_str)
            action = result.get('action')
            # print(action)
            if action == 'screen_items':
                page.clean()
                await render_page(page, result.get('data', {}).get('Elements', []))
            else:
                render_func = render_mapping[action]
                # print(render_func)
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

def _get_documents_list_view(page: ft.Page, result: dict):
    # ЭТО ПОТОМ УДАЛЮ
    #processes_data = result.get('data', [])
    fab = ft.FloatingActionButton(
        #on_click=on_fab_clicked,
        bgcolor=ft.colors.ORANGE_800, 
        shape=ft.CircleBorder(),
        #content=ft.Text('║▌║║', size=10, color=ft.colors.WHITE)
        content=ft.Text('║║║', size=10, color=ft.colors.WHITE)
    )
    page.floating_action_button = fab
    docs_data = (
            ("К выполнению", "Сборка", "ТД00-000013", "ООО Бытовая техника", "Центральный склад"),
            ("К выполнению", "Сборка", "ТД00-000014", "ООО Рога и копыта", "Центральный склад"),
            ("К выполнению", "Сборка", "ТД00-000015", "ООО Торговый Дом", "Центральный склад"),
            ("К выполнению", "Сборка", "ТД00-000016", "ООО Ромашка", "Центральный склад"),
            ("К выполнению", "Сборка", "ТД00-000017", "ООО Бытовая техника", "Центральный склад"),
            ("К выполнению", "Сборка", "ТД00-000013", "ООО Бытовая техника", "Центральный склад"),
            ("К выполнению", "Сборка", "ТД00-000014", "ООО Рога и копыта", "Центральный склад"),
            ("К выполнению", "Сборка", "ТД00-000015", "ООО Торговый Дом", "Центральный склад"),
        )
    header = DocumentFilterHeader()
    list_view = ft.ListView(expand=1, spacing=10, padding=3)
    
    for elem in docs_data:
        list_view.controls.append(DocumentCard(*elem))
    
    controls = [header, list_view]
    page.clean()
    page.add(header)
    page.add(list_view)

