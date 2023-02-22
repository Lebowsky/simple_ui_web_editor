import os
import json
from json import JSONDecodeError
import jsonref
import io

from eel import chrome
from pydantic import ValidationError
import qrcode
import socket
import base64

from models.root_config import RootConfigModel, QRCodeConfig, OperationsModel



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


def get_config_ui_elements(Model) -> dict:
    scheme = jsonref.loads(Model.schema_json(indent=2, ensure_ascii=True))
    result = {}

    for k, v in scheme['definitions'].items():
        config_item = {}
        props = v.get('properties', None)
        if not props:
            continue

        for prop, value in props.items():
            if prop == 'type':
                continue

            required = v.get('required', None)

            if value.get('enum', None):
                config_item[prop] = {
                    'type': 'select',
                    'options': value.get('enum')
                }
            elif value.get('anyOf', None):
                options = []
                for item in value.get('anyOf'):
                    if 'enum' in item.keys():
                        options.extend(item['enum'])

                if len(options) > 0:
                    config_item[prop] = {
                        'type': 'text',
                    }
                else:
                    config_item[prop] = {
                        'type': 'select',
                        'options': options
                    }
            else:
                config_item[prop] = {
                    'type': 'text',
                }
            config_item[prop]['required'] = required and prop in required
        result[v['title']] = config_item
    return result
