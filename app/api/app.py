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


from ..config import resource_path, app_server_port, app_server_host
from ..utils import make_ui_config, save_config_to_file
from ..preview.preview import listen_for_updates
from ..ui import (
    get_current_file_path,
    set_device_host,
    get_configuration,
    get_config_project_path,
    send_notify
)


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
            message = await websocket.receive_text()
            await sio.emit('some_event', {'message': message}) # Используем sio для отправки сообщений
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
        for ws in active_websockets:
            await ws.send_text(data_str)
        return {"message": "Data processed and sent"}
    except Exception as e:
        print(f"Error processing request: {e}")
        return {"error": str(e)}

run_uvicorn()

@app.get('/get_conf')
async def get_config(request: Request):
    configuration = await get_configuration()
    config_path = await get_config_project_path()
    await set_device_host(request.client.host)
    await send_notify(f'{request.client.host} - "{request.method} {request.url}"')
    return make_ui_config(configuration, config_path)

@app.post('/set_conf')
async def save_config(request: Request):
    file_path = await get_current_file_path()
    data = await request.json()
    try:
        save_config_to_file(data, file_path)
    except Exception as e:
        print(f"Error saving config: {e}")
        return {"error": str(e)}

    return {"message": "Configuration saved successfully!"}

async def flet_app(page: ft.Page):
    invite_text = ft.Text(value="Для отображения превью необходимо выбрать процесс или экран..", size=16, color=ft.colors.BLACK54)
    page.add(invite_text)
    uri = f"ws://localhost:{app_server_port}/ws_flet"
    await listen_for_updates(page, uri)

app.mount("/flet_preview", ft.app(flet_app, export_asgi_app=True))


