import os
import socket
import json
from json import JSONDecodeError

from eel import chrome
from pydantic import ValidationError

from models import RootConfigModel


def can_use_chrome():
    """ Identify if Chrome is available for Eel to use """
    chrome_instance_path = chrome.find_path()
    return chrome_instance_path is not None and os.path.exists(chrome_instance_path)


def get_port():
    """ Get an available port by starting a new server, stopping and and returning the port """
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind(('localhost', 0))
    port = sock.getsockname()[1]
    sock.close()
    return port


def save_config_to_file(config_data, file_path):
    config = RootConfigModel(**config_data)
    with open(file_path, 'w', encoding="utf-8") as f:
        json.dump(config.dict(), f, ensure_ascii=False, indent=4, separators=(',', ': '))


def get_config_from_file(file_path):
    if check_config_file(file_path):
        with open(file_path, encoding='utf-8') as json_file:
            return json.load(json_file)


def check_config_file(file_path):
    if file_path:
        with open(file_path, encoding='utf-8') as json_file:
            try:
                config = RootConfigModel(**json.load(json_file))
                return {'file_path': file_path}
            except JSONDecodeError as e:
                return {'error': 'JSONDecodeError', 'message': e.msg}
            except ValidationError as e:
                return {'error': 'ValidationError', 'message': e.json()}
            except Exception as e:
                return {'error': 'UnknownError', 'message': str(e)}
