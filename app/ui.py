import eel

import utils
import config
import dialogs
from utils import get_qr_code_config


class UIOpenMode:
    NONE = 0
    CHROME = 1
    USER_DEFAULT = 2


# Setup eels root folder
eel.init(config.FRONTEND_ASSET_FOLDER)


@eel.expose
def save_configuration(data, file_path):
    utils.save_config_to_file(data, file_path)


@eel.expose
def load_configuration(file_path):
    return utils.get_config_from_file(file_path)


@eel.expose
def ask_file(file_type):
    """ Ask the user to select a file """
    return dialogs.ask_file(file_type)


@eel.expose
def get_qr_settings():
    return str(get_qr_code_config())


async def get_current_file_path():
    return eel.get_current_file_path()()


def start(open_mode):
    try:
        chrome_available = utils.can_use_chrome()
        if open_mode == UIOpenMode.CHROME and chrome_available:
            eel.start('index.html', size=(1080, 780), port=0)
        elif open_mode == UIOpenMode.USER_DEFAULT or (open_mode == UIOpenMode.CHROME and not chrome_available):
            eel.start('index.html', size=(1080, 720), port=0, mode='user default')
        else:
            port = utils.get_port()
            print('Server starting at http://localhost:' + str(port) + '/index.html')
            eel.start('index.html', size=(1080, 720), host='localhost', port=port, mode=None,
                      close_callback=lambda x, y: None)
    except (SystemExit, KeyboardInterrupt):
        pass  # This is what the bottle server raises