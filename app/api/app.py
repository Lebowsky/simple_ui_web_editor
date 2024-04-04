import contextlib
import threading
import time
import json
import flet as ft

import uvicorn
from fastapi import FastAPI, WebSocket, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware

from fastapi_socketio import SocketManager

from .preview_app import AsyncSimple
from ..config import resource_path, app_server_port, app_server_host
from ..utils import get_config_from_file, get_python_modules
from .priview import listen_for_updates

sw: AsyncSimple

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешает все источники
    allow_credentials=True,
    allow_methods=["*"],  # Разрешает все методы
    allow_headers=["*"],  # Разрешает все заголовки
)
templates = Jinja2Templates(directory=resource_path('app/web/templates'))
sio = SocketManager(app)
server = ...

active_websockets = set()

# Монтируем статические файлы
app.mount("/static", StaticFiles(directory=resource_path('app/web/templates/preview/static')), name="static")

# Создаем экземпляр сервера
class Server(uvicorn.Server):
    @contextlib.contextmanager
    def run_in_thread(self):
        thread = threading.Thread(target=self.run)
        thread.start()
        try:
            while not self.started:
                time.sleep(1e-3)
            yield
        finally:
            self.should_exit = True
            thread.join()

def run_uvicorn():
    global server
    server = Server(uvicorn.Config(app=app, host=app_server_host, port=app_server_port, reload=True))

def restart_uvicorn(port: int):
    global server
    if server:
        server.shutdown()

    config = uvicorn.Config(app=app, host=app_server_host, port=port, reload=True)
    server = Server(config)

# Определяем обработчики WebSocket
@app.websocket("/ws_flet")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_websockets.add(websocket)
    try:
        while True:
            # В Flet это будет обрабатываться иначе, здесь же мы просто ожидаем сообщения
            message = await websocket.receive_text()
            await sio.emit('some_event', {'message': message}, namespace='/simpleweb') # Используем sio для отправки сообщений
    except Exception as e:
        print(f"WebSocket Error: {e}")
    finally:
        active_websockets.remove(websocket)

@app.post("/ws_editor")
async def trigger_update(request: Request):
    print("Received request for /ws_editor")
    try:
        data = await request.json()
        data_str = json.dumps(data, ensure_ascii=False, indent=2)
        print(f"Data received: {data_str}")
        # Отправляем данные всем подключенным клиентам
        for ws in active_websockets:
            await ws.send_text(data_str)
        return {"message": "Data processed and sent"}
    except Exception as e:
        print(f"Error processing request: {e}")
        return {"error": str(e)}

run_uvicorn()


@app.get('/get_conf')
async def get_config(request: Request):
    from ..ui import get_current_file_path, set_device_host, get_configuration

    # file_path = await get_current_file_path()
    # config = get_config_from_file(file_path)
    config = await get_configuration()
    await set_device_host(request.client.host)
    return config


@app.get('/prev', response_class=HTMLResponse)
async def prev_index(request: Request):
    global sw
    try:
        sw = AsyncSimple(sio, templates=templates, python_modules=get_python_modules())
        response = await sw.get_preview_page(request)
        return response
    except Exception as e:
        import traceback
        with open(resource_path('app/web/templates/error_500_response.html'), encoding='utf-8') as f:
            response = HTMLResponse(content=f.read().replace('Message Here', str(e)))
            print(traceback.format_exc())
            return response


@sio.on('connect_event', namespace='/simpleweb')
async def connect(sid, message):
    sw.set_sid(sid)
    await sw.connect_event(message=message)
    print('connect_event')


@sio.on('run_process', namespace='/simpleweb')
async def run_process(sid, message):
    print('run_process')
    await sw.run_process(message)


@sio.on('input_event', namespace='/simpleweb')
async def input_event(sid, message):
    print('input_event')
    await sw.input_event(message)


@sio.on('close_maintab', namespace='/simpleweb')
async def close_maintab(sid, message):
    print('close_maintab')
    await sw.close_maintab(message)


@sio.on('select_tab', namespace='/simpleweb')
async def select_tab(sid, message):
    print('select_tab')
    await sw.select_tab(message)


@sio.on('disconnect_request', namespace='/simpleweb')
def disconnect_request():
    print('disconnect_request')

async def flet_app(page: ft.Page):
    invite_text = ft.Text(value="Для отображения превью необходимо выбрать процесс или экран..", size=16, color=ft.colors.BLACK54)
    page.add(invite_text)
    uri = f"ws://localhost:{app_server_port}/ws_flet"
    await listen_for_updates(page, uri)

app.mount("/flet_preview", ft.app(flet_app, export_asgi_app=True))


