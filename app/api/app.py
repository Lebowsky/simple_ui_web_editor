import contextlib
import threading
import time

import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from fastapi_socketio import SocketManager

from .preview_app import AsyncSimple
from ..config import resource_path, app_server_port, app_server_host
from ..utils import get_config_from_file, get_python_modules

sw: AsyncSimple

app = FastAPI()
app.mount("/static", StaticFiles(directory=resource_path('app/web/templates/preview/static')), name="static")
templates = Jinja2Templates(directory=resource_path('app/web/templates'))

sio = SocketManager(app)
server = ...

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


run_uvicorn()


@app.get('/get_conf')
async def get_config(request: Request):
    from ..ui import get_current_file_path, set_device_host

    file_path = await get_current_file_path()
    config = get_config_from_file(file_path)
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
