import os
import sys
import json
from json import JSONDecodeError
import jsonref
import io

from eel import chrome
from pydantic import ValidationError
import qrcode
import socket
import base64

from .models.root_config import RootConfigModel, QRCodeConfig, OperationsModel
from .models.ui_config import create_element, BaseField, ElementType, convert_to_dict

def resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)

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
    if not file_path:
        raise FileNotFoundError('Не указан файл конфигурации')
    config = RootConfigModel(**config_data)
    with open(file_path, 'w', encoding="utf-8") as f:
        json.dump(config.dict(by_alias=True, exclude_none=True), f, ensure_ascii=False, indent=4,
                  separators=(',', ': '))


def get_config_from_file(file_path):
    if file_path:
        check_result = check_config_file(file_path)
        if check_result:
            if check_result.get('error'):
                return check_result
            else:
                with open(file_path, encoding='utf-8') as json_file:
                    return RootConfigModel(**json.load(json_file)).dict(by_alias=True, exclude_none=True)
        else:
            raise Exception(check_result)


def get_new_config():
    return RootConfigModel().dict(by_alias=True, exclude_none=True)


def check_config_file(file_path):
    try:
        with open(file_path, encoding='utf-8') as json_file:
            config = RootConfigModel(**json.load(json_file))
            return {'file_path': file_path}
    except JSONDecodeError as e:
        return {'error': 'JSONDecodeError', 'message': e.msg}
    except ValidationError as e:
        return {'error': 'ValidationError', 'message': e.json()}
    except FileNotFoundError as e:
        return {'error': 'FileNotFoundError', 'message': e.winerror}
    except Exception as e:
        return {'error': 'UnknownError', 'message': json.dumps({'error': str(e)})}


def get_qr_code_config():
    host = socket.gethostbyname(socket.gethostname())
    port = 5000
    url = f'http://{host}:{port}/get_conf'

    qr_config = QRCodeConfig(RawConfigurationURL=url)
    img = qrcode.make(qr_config.json(by_alias=True, exclude_none=True))
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")

    base_64_mage = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return base_64_mage


def _get_config_ui_elements(Model=RootConfigModel) -> dict:
    scheme = jsonref.loads(Model.schema_json(indent=2, ensure_ascii=True))
    result = {}

    for k, v in scheme['definitions'].items():
        config_item = {}
        props = v.get('properties', None)
        if not props:
            continue

        required = v.get('required', None)

        for prop, value in props.items():
            if prop == 'type':
                continue

            if prop == 'Elements':
                elements = _get_elements_items(value)
                for el in elements:
                    curr = result.get(el, None)
                    if curr:
                        if curr.get('type', None) is None:
                            curr['type'] = []

                        curr['type'].append(
                            {
                                'parent': v['title'],
                                'type': 'select',
                                'options': elements,
                                'text': 'type'
                            })
                    else:
                        config_item['type'] = [{
                            'parent': v['title'],
                            'type': 'select',
                            'options': elements,
                        }]

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
                if value.get('title', None) and value['title'] in ['Operations', 'Elements', 'Handlers']:
                    config_item[prop] = {
                        'type': value['title'].lower(),
                    }
                elif value.get('type', None) and value['type'] == 'boolean':
                    config_item[prop] = {
                        'type': 'checkbox',
                    }
                else:
                    config_item[prop] = {
                        'type': 'text',
                    }
            config_item[prop]['text'] = prop
            config_item[prop]['required'] = required and prop in required
        result[v['title']] = config_item
    return result


def get_config_ui_elements(Model=RootConfigModel) -> dict:
    scheme = jsonref.loads(Model.schema_json(indent=2, ensure_ascii=True))
    elements = [v for v in scheme['definitions'].values() if v.get('properties', None)]
    result = {}
    containers = {}

    for el in elements:
        fields = {}
        title = el['title']

        for key, value in el['properties'].items():
            if key == 'type':
                continue
            fields[key] = BaseField(text=value.get('title') or key, **value)
            if key == 'Elements':
                containers[title] = _get_elements_items(value)

        result[title] = create_element(title, fields).dict(exclude_none=True)

    for key, value in containers.items():
        for item in value:
            element_type = ElementType(parent=key, type='select', options=value, text='type')

            result[item]['type'].append(element_type)

    return convert_to_dict(result)


def _get_elements_items(value):
    result = []

    if value.get('items', None):
        if value['items'].get('oneOf', None):
            result = [element['title'] for element in value['items']['oneOf']]
        elif value['items'].get('anyOf', None):
            result = [element['title'] for element in value['items']['anyOf']]

    return result


def make_base64_from_file(file_path: str) -> str:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as file:
            data = file.read()
            base64file = base64.b64encode(data.encode('utf-8')).decode('utf-8')
            return base64file


def get_content_from_base64(base_64_str: str) -> str:
    return base64.b64decode(base_64_str).decode('utf-8')
