import flet as ft
import websockets
import json
from .controls import ProcessButton, DocumentFilterHeader, FirstLineCard, DocumentCard


'''async def listen_for_updates(page: ft.Page):
    
    render_mapping = {
        'processes_list': _get_processes_list_view,
        'screen_items': _get_render_screen,
        'screen_documents': _get_documents_list_view
    }
    uri = "ws://localhost:5000/ws_flet"
    async with websockets.connect(uri) as websocket:
        while True:
            data_str = await websocket.recv()
            print('LALALAL', data_str)
            result = json.loads(data_str)
            print(result)
            action = result.get('action')
            print(action)
            if action in render_mapping:
                render_func = render_mapping[action]
                render_func(page, result)
                
                if view is not None:
                    page.clean()
                    page.add(view)
                page.update()'''

async def listen_for_updates(page: ft.Page, uri: str):
    # Определение маппинга действий на функции рендеринга
    render_mapping = {
        'processes_list': _get_processes_list_view,
        'screen_items': _get_render_screen,
        'screen_documents': _get_documents_list_view 
    }

    async with websockets.connect(uri) as websocket:
        while True:
            data_str = await websocket.recv()
            result = json.loads(data_str)
            action = result.get('action')

            # Используем маппинг для определения функции рендеринга
            if action in render_mapping:
                render_func = render_mapping[action]
                await render_func(page, result)  
                page.update()

async def _get_render_screen(page: ft.Page, result: dict):
    data = result.get('data', {})
    # Обрабатываем JSON с элементами
    if 'Elements' in data:
        elements = data['Elements']
        if elements and elements[0].get('type') == 'Tiles':
            tiles_view = _get_tiles_view_from_json(data)
            page.clean()
            page.add(tiles_view)

async def _get_processes_list_view(page: ft.Page, result: dict):
    processes_data = result.get('data', [])
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
