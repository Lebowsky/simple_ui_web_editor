import flet as ft
import websockets
import json
from .controls import ProcessButton, DocumentFilterHeader, FirstLineCard, DocumentCard


def create_column(data, controls=[]):
    orientation = ft.CrossAxisAlignment.CENTER if data.get('width') == 'match_parent' else ft.CrossAxisAlignment.START
    return ft.Column(controls, horizontal_alignment=orientation)

def create_row(data, controls=[]):
    orientation = ft.MainAxisAlignment.CENTER if data.get('width') == 'match_parent' else ft.MainAxisAlignment.START
    return ft.Row(controls=controls, alignment=orientation)

def create_text_view(data):

    text_size = int(data.get('TextSize', 11))
    value = data.get('Value', "")
    text_color = data.get('TextColor', "black")
    text_weight = ft.FontWeight.W_600 if data.get('TextBold', False) else ft.FontWeight.NORMAL

    return ft.Text(value, size=text_size, color=text_color, weight=text_weight)

def create_button(data):
    #size = int(data.get('TextSize'), 12)
    value = data.get('Value')
    return ProcessButton(value)

def create_container(data, control=None):

    return ft.Container(control)

def create_dropdown(data):
    value = data.get('value')
    return ft.Dropdown(value)

def create_element(data):
    type_mapping = {
        "TextView": create_text_view,
        "Button": create_button,
        "SpinnerLayout": create_dropdown,
        "LinearLayout": render_container_layout,
        "Tiles": render_tiles,
    }

    element_type = data.get("type")
    create_func = type_mapping.get(element_type)

    if create_func:
        return create_func(data)
    else:
        print(f"Неизвестный тип элемента: {element_type}")
        return None

def render_tiles(data):
    gv = ft.GridView(expand=True, max_extent=250, child_aspect_ratio=1.4)

    header = data['Value']
    tiles_elements = data["Elements"]

    for elem_index in range(1, 17):  # Создаем 16 плиток
        '''tile_title = [
            ft.Row(controls=[
                ft.Text(f'{header}_Элемент_{elem_index}',
                        color="black",
                        text_align=ft.TextAlign.CENTER,
                        weight=ft.FontWeight.W_600,
                        size=18,
                        expand=1)
            ],
                   alignment='center'),
        ]'''

        # Для каждого элемента в tiles_elements создаем Row с Text и добавляем его в список tile_controls
        tile_controls = [create_element(element_data) for element_data in tiles_elements if element_data is not None]

        # Используем tile_controls для создания Column
        tile_column = ft.Column(controls=tile_controls, spacing=3)

        tile_container = ft.Container(
            content=tile_column,
            bgcolor=ft.colors.WHITE,
            border=ft.border.all(1, ft.colors.BLACK12),
            padding=5
        )
        gv.controls.append(tile_container)
    
    return gv


def render_container_layout(data):
    orientation = data.get("orientation", "vertical").lower()
    elements_data = data.get("Elements", [])

    controls = [create_element(element_data) for element_data in elements_data if element_data is not None]

    if orientation == "vertical":
        return create_column(data, controls)
    else:
        return create_row(data, controls)

async def render_page(page: ft.Page, elements_data):
    for element_data in elements_data:
        element = create_element(element_data)
        if element:
            page.add(element)
    page.update()


async def listen_for_updates(page: ft.Page, uri: str):
    render_mapping = {
        'processes_list': _get_processes_list_view,
        'screen_items': render_page, #_get_render_screen,
        'screen_documents': _get_documents_list_view 
    }

    async with websockets.connect(uri) as websocket:
        while True:
            data_str = await websocket.recv()
            result = json.loads(data_str)
            action = result.get('action')
            print(action)
            if action == 'screen_items':
                page.clean()
                await render_page(page, result.get('data', {}).get('Elements', []))
            else:
                render_func = render_mapping[action]
                print(render_func)
                await render_func(page, result.get('data'))  

            page.update()

async def _get_render_screen(page: ft.Page, result: dict):
    # start here

    data = result.get('data', {})
    # Обрабатываем JSON с элементами
    if 'Elements' in data:
        elements = data['Elements']
        if elements and elements[0].get('type') == 'Tiles':
            tiles_view = _get_tiles_view_from_json(data)
            page.clean()
            page.add(tiles_view)

async def _get_processes_list_view(page: ft.Page, processes_data: dict):
    #processes_data = result.get('data', [])
    # Обрабатываем список строк
    if isinstance(processes_data, list) and all(isinstance(item, str) for item in processes_data):
        list_view = ft.ListView(expand=1, spacing=15, padding=3)
        for btn_title in processes_data:
            list_view.controls.append(ProcessButton(btn_title))
        page.clean()
        page.add(list_view)

def _get_documents_list_view(page: ft.Page, result: dict):
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
    #page.controls = controls
    #page.update()

def _get_tiles_view_from_json(data):
    gv = ft.GridView(expand=True, max_extent=250, child_aspect_ratio=1.4)

    header = data["Elements"][0]['Value']
    tiles_elements = data["Elements"][0]["Elements"]

    for elem_index in range(1, 17):  # Создаем 16 плиток
        tile_controls = [
            ft.Row(controls=[
                ft.Text(f'{header}_Элемент_{elem_index}',
                        color="black",
                        text_align=ft.TextAlign.CENTER,
                        weight=ft.FontWeight.W_600,
                        size=18,
                        expand=1)
            ],
                   alignment='center'),
        ]

        # Для каждого элемента в tiles_elements создаем Row с Text и добавляем его в список tile_controls
        for element in tiles_elements:
            value = element.get("Value", "").replace("@", "")
            text_control = ft.Text(value, color="black", size=11)
            tile_controls.append(ft.Row(controls=[text_control]))

        # Используем tile_controls для создания Column
        tile_column = ft.Column(controls=tile_controls, spacing=3)

        tile_container = ft.Container(
            content=tile_column,
            bgcolor=ft.colors.WHITE,
            border=ft.border.all(1, ft.colors.BLACK12),
            padding=5
        )
        gv.controls.append(tile_container)

    return gv
