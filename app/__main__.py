import ui
import config


def start_ui():
    ui.start(config.ui_open_mode)


def run():
    start_ui()


if __name__ == '__main__':
    run()
