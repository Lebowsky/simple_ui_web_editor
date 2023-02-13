import threading
import uvicorn

import ui
import config

from api.app import app


def start_ui():
    ui.start(config.ui_open_mode)


def start_api():
    threading.Thread(target=uvicorn.run, kwargs=dict(app=app, host="0.0.0.0", port=5000)).start()


def run():
    start_api()
    start_ui()


if __name__ == '__main__':
    run()
