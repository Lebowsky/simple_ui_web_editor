import os
import json
from json import JSONDecodeError
import io

from eel import chrome
from pydantic import ValidationError
import qrcode
import socket
import base64

from models import RootConfigModel, QRCodeConfig


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


def get_qr_code_config():
    host = socket.gethostbyname(socket.gethostname())
    port = 5000
    url = f'http://{host}:{port}/get_conf'

    qr_config = QRCodeConfig(RawConfigurationURL=url)

    img = qrcode.make(json.dumps(qr_config.json()))
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")

    base_64_mage = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return base_64_mage
