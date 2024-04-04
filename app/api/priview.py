import flet as ft
import websockets
import json
from .controls import ProcessButton, DocumentFilterHeader, FirstLineCard, DocumentCard


async def listen_for_updates(page: ft.Page):
    
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
                
                '''if view is not None:
                    page.clean()
                    page.add(view)'''
                page.update()

def _get_render_screen(page: ft.Page, result: dict):
    elements = result['data'].get('Elements', [])
    if elements and elements[0].get('type') == 'Tiles':
        value = elements[0].get('Value').replace('@','') or 'Плитки'
        page.clean()
        page.add(_get_tiles_view(value))
        page.update()
    #return None

def _get_processes_list_view(page: ft.Page, result: dict):
    processes_data = result.get('data', [])
    list_view = ft.ListView(expand=1, spacing=15, padding=3)
    for btn_title in processes_data:
        list_view.controls.append(ProcessButton(btn_title))
    page.clean()
    page.add(list_view)
    page.update()

def _get_documents_list_view(page: ft.Page, result: dict):
    #processes_data = result.get('data', [])
    fab = ft.FloatingActionButton(
        #on_click=on_fab_clicked,
        bgcolor=ft.colors.ORANGE_800, 
        shape=ft.CircleBorder(),
        content=ft.Text('║▌║║', size=14, color=ft.colors.WHITE)
    )
    page.floating_action_button = fab
    docs_data = (
            ("К выполнению", "Сборка", "ТД00-000013", "ООО Бытовая техника", "Центральный склад"),
            ("К выполнению", "Сборка", "ТД00-000014", "ООО Рога и копыта", "Центральный склад"),
            ("К выполнению", "Сборка", "ТД00-000015", "ООО Торговый Дом", "Центральный склад"),
            ("К выполнению", "Сборка", "ТД00-000016", "ООО Ромашка", "Центральный склад"),
            ("К выполнению", "Сборка", "ТД00-000017", "ООО Бытовая техника", "Центральный склад")
        )
    header = DocumentFilterHeader()
    list_view = ft.ListView(expand=1, spacing=10, padding=3)
    
    for elem in docs_data:
        list_view.controls.append(DocumentCard(*elem))
    
    controls = [header, list_view]
    page.clean()
    page.controls = controls
    page.update()

def _get_tiles_view(value):
    gv = ft.GridView(expand=True, max_extent=250, child_aspect_ratio=1.4)
    for elem in range(1,17):
        gv.controls.append(
            ft.Container(
                ft.Column(
                    controls=[
                        ft.Row(controls=[
                            ft.Text(f'{value}_Элемент_{elem}', 
                                color="black", 
                                text_align=ft.TextAlign.CENTER, 
                                weight= ft.FontWeight.W_600, 
                                size=18, 
                                expand=1)
                            ], 
                            alignment='center'),
                        ft.Row(controls=[ft.Text("1/0", color="black", size=11),]),
                        ft.Row(controls=[ft.Text("Строк: 2/0", color="black", size=11),]),
                        ft.Row(controls=[ft.Text("Товаров: 10/0", color="black", size=11),])
                    ],
                    spacing=3
                    ),
            bgcolor=ft.colors.WHITE,
            border=ft.border.all(1, ft.colors.BLACK12),
            )
        )
    return gv
