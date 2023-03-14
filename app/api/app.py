import contextlib
import threading
import time

import uvicorn
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi_socketio import SocketManager

from api.preview_app import AsyncSimple
from utils import get_config_from_file

sw: AsyncSimple

app = FastAPI()
sio = SocketManager(app)


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


server = Server(uvicorn.Config(app=app, host="0.0.0.0", port=5000, log_level="info"))


@app.get('/get_conf')
async def get_config():
    from ui import get_current_file_path

    file_path = await get_current_file_path()
    config = get_config_from_file(file_path)
    return config


@app.get('/prev', response_class=HTMLResponse)
async def prev_index():
    global sw
    sw = AsyncSimple(sio)
    return HTMLResponse(content=await sw.build_page())


@sio.on('connect_event', namespace='/simpleweb')
def connect(sid, *args):
    sw.set_sid(sid)
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
