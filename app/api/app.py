import contextlib
import threading
import time

import uvicorn
from fastapi import FastAPI

from utils import get_config_from_file

app = FastAPI()


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
