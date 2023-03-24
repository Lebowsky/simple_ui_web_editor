from . import ui
from . import config

from .api.app import server


def start_ui():
    ui.start(config.ui_open_mode)


def start_api():
    with server.run_in_thread():
        start_ui()


def run():
    start_api()


if __name__ == '__main__':
    run()
