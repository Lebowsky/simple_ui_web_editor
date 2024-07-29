import io
import os
import pathlib
import socket
import base64
import glob
import pathlib
from typing import Union

import requests
import json
import jsonref
from eel import chrome
from pydantic import ValidationError
import qrcode

from .models import ui_config
from .models.handlers import Handler
from .models.root_config import RootConfigModel, QRCodeConfig
from .config import app_server_port

python_modules = {}


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


def save_config_to_file(config_data, file_path, project_config_path=None):
    if not file_path:
        raise FileNotFoundError('Не указан файл конфигурации')
    config = RootConfigModel(**config_data)
    clear_local_paths_data(config)
    data_to_save = config.dict(by_alias=True, exclude_none=True)
    if project_config_path:
        save_base64_data(data_to_save, project_config_path)
    with open(file_path, 'w', encoding="utf-8") as f:
        json.dump(data_to_save, f, ensure_ascii=False, indent=4,
                  separators=(',', ': '))

def clear_local_paths_data(config_model: RootConfigModel):
    config_model.client_configuration.py_handlers_path = None
    for py_file in config_model.client_configuration.py_files:
        py_file.file_path = None


def get_config_from_file(file_path):
    if file_path:
        check_result = check_config_file(file_path)
        if check_result:
            if check_result.get('error'):
                if check_result['error'] == 'VersionError':
                    return convert_config_version(file_path)
                else:
                    return check_result
            else:
                with open(file_path, encoding='utf-8') as json_file:
                    json_data = json.load(json_file)
                    check_file_paths(json_data, os.path.split(file_path)[0])
                    return RootConfigModel(**json_data).dict(by_alias=True, exclude_none=True)
        else:
            raise Exception(check_result)


def get_new_config():
    return RootConfigModel().dict(by_alias=True, exclude_none=True)


def check_config_file(file_path):
    try:
        with open(file_path, encoding='utf-8') as json_file:
            json_data = json.load(json_file)
            RootConfigModel(**json_data)
            check_config_version(json_data)
            return {'file_path': file_path}
    except json.JSONDecodeError as e:
        return {'error': 'JSONDecodeError', 'message': e.msg}
    except ValidationError as e:
        return {'error': 'ValidationError', 'message': json.dumps(e.json())}
    except FileNotFoundError as e:
        return {'error': 'FileNotFoundError', 'message': e.winerror}
    except VersionError as e:
        return {
            'error': 'VersionError',
            'message': json.dumps({'error': str(e)}),
            'file_path': file_path
        }
    except Exception as e:
        return {'error': 'UnknownError', 'message': json.dumps({'error': str(e)})}


def check_config_version(data: dict):
    for item in ['DefServiceConfiguration', 'OnlineServiceConfiguration']:
        if item in data.keys() and data[item]:
            raise VersionError('Unsupported configuration version')

    check_keys = ['DefOnCreate', 'DefOnInput', 'DefOnlineOnCreate', 'DefOnlineOnInput']

    for process in data['ClientConfiguration']['Processes']:
        if not process.get('Operations'):
            continue
        for operation in process['Operations']:
            for item in check_keys:
                if item in operation.keys() and operation[item]:
                    raise VersionError('Unsupported configuration version')


def check_file_paths(data: dict, path: str):
    project_config_data = get_data_from_project_config(path)

    py_files = data['ClientConfiguration'].get('PyFiles', [])
    for item in py_files:
        if item.get('file_path') and not os.path.exists(item['file_path']):
            item['file_path'] = ''

        # local_path = project_conf.get(item['PyFileKey'], '')
        local_path = ''

        file_path = pathlib.Path(path, local_path, '{}.py'.format(item['PyFileKey']))
        if file_path.exists():
            item['file_path'] = str(file_path)

    file_path = data['ClientConfiguration'].get('pyHandlersPath') or project_config_data.get('handlers')
    if file_path and not os.path.exists(file_path):
        data['ClientConfiguration']['pyHandlersPath'] = ''

    file_path = os.path.join(path, 'main.py')
    if os.path.exists(file_path) and not data['ClientConfiguration'].get('pyHandlersPath'):
        data['ClientConfiguration']['pyHandlersPath'] = file_path


def get_data_from_project_config(path):
    path_to_config = pathlib.Path(path) / 'project_config.json'
    project_conf = {}
    if path_to_config.exists():
        with open(path_to_config) as f:
            try:
                project_conf = json.load(f)
            except json.JSONDecodeError:
                project_conf = {}

    return project_conf


def save_project_config_to_file(data, path_to_project):
    file_name = 'project_config.json'
    path_to_project_config = pathlib.Path(path_to_project, file_name)
    config_data = create_project_config_data(data['ClientConfiguration'], path_to_project)
    with open(path_to_project_config, 'w', encoding='utf-8') as f:
        json.dump(config_data, f, ensure_ascii=False, indent=2)


def create_project_config_data(files_data: dict, project_path: str):
    def get_relpath(full_path, prefix):
        full_path = str(pathlib.Path(full_path))
        prefix = str(pathlib.Path(prefix))
        return f'./{os.path.relpath(full_path, os.path.commonprefix([full_path, prefix]))}'

    result = {}
    handlers_path = files_data.get('pyHandlersPath')
    py_files = files_data.get('PyFiles')

    if handlers_path:
        result['handlers'] = get_relpath(handlers_path, project_path)

    if py_files:
        modules = {
            item['PyFileKey']: get_relpath(item['file_path'], project_path)
            for item in py_files if item.get('file_path')
        }
        result['modules'] = modules
    return result


def save_base64_data(ui_configuration: dict, project_config_path: str = None):
    if project_config_path:
        try:
            with open(project_config_path, encoding='utf-8') as fp:
                project_config_data = json.load(fp)
                handlers_path = project_config_data.get('handlers')
                modules = project_config_data.get('modules', {})
                media_files = project_config_data.get('media_files', {})
        except json.JSONDecodeError:
            return

        work_dir = pathlib.Path(project_config_path).parent

        if handlers_path:
            file_path = pathlib.Path(work_dir / handlers_path)
            ui_configuration['ClientConfiguration']['PyHandlers'] = (
                make_base64_from_file_path(str(file_path))
            )

        if modules:
            py_files = []
            for key, path in modules.items():
                file_path = pathlib.Path(work_dir / path)
                py_files.append({
                    'PyFileKey': key,
                    'PyFileData': make_base64_from_file_path(str(file_path))
                })
            ui_configuration['ClientConfiguration']['PyFiles'] = py_files

        if media_files:
            media_files_data = []
            for key, path in media_files.items():
                file_path = pathlib.Path(work_dir / path)
                ext = pathlib.Path(path).suffix[1:]

                media_files_data.append({
                    'MediafileKey': key,
                    'MediafileExt': ext,
                    'MediafileData': make_base64_from_file_path(str(file_path))
                })
            ui_configuration['ClientConfiguration']['Mediafile'] = media_files_data

    # else:
    #     file_path = ui_configuration['ClientConfiguration'].get('pyHandlersPath')
    #     if file_path:
    #         ui_configuration['ClientConfiguration']['PyHandlers'] = make_base64_from_file_path(file_path)
    #
    #     py_files = ui_configuration['ClientConfiguration'].get('PyFiles', [])
    #     for item in py_files:
    #         if item.get('file_path'):
    #             item['PyFileData'] = make_base64_from_file_path(item['file_path'])

def make_ui_config(configuration: dict, config_path: str = None):
    if configuration:
        valid_config = validate_configuration_model(configuration)
        save_base64_data(valid_config, config_path)
        return valid_config

def validate_configuration_model(ui_configuration: dict) -> dict:
    try:
        return RootConfigModel(**ui_configuration).dict(by_alias=True, exclude_none=True)
    except ValidationError as e:
        raise e
    except Exception as e:
        raise e


def convert_config_version(file_path):
    with open(file_path, encoding='utf-8') as json_file:
        data = json.load(json_file)

        check_keys = {
            'DefOnCreate': {'event': 'onStart', 'action': 'run', 'type': 'python'},
            'DefOnInput': {'event': 'onInput', 'action': 'run', 'type': 'python'},
            'DefOnlineOnCreate': {'event': 'onStart', 'action': 'run', 'type': 'online'},
            'DefOnlineOnInput': {'event': 'onInput', 'action': 'run', 'type': 'online'}
        }

        for process in data['ClientConfiguration']['Processes']:
            if not process.get('Operations'):
                continue

            for operation in process['Operations']:
                handlers = operation.get('Handlers', [])
                for item in check_keys:
                    if item in operation.keys() and operation[item]:
                        handlers.append(
                            Handler(method=operation[item], **check_keys[item]))
                operation['Handlers'] = handlers

        result = RootConfigModel(**data).dict(by_alias=True, exclude_none=True)
        return result


def get_qr_configs():
    interfaces = get_socket_interfaces()
    return [{'host': host, 'image': get_qr_code_config(host)}
            for host in interfaces]


def get_socket_interfaces():
    return [
        ip[0] for af, _, __, ___, ip
        in socket.getaddrinfo(socket.gethostname(), None)
        if af == socket.AF_INET
    ]


def get_qr_code_config(host=None):
    host = host or socket.gethostbyname(socket.gethostname())
    port = app_server_port
    url = f'http://{host}:{port}/get_conf'
    online_url = f'http://{host}:2076'

    qr_config = QRCodeConfig(
        RawConfigurationURL=url,
        onlineURLListener=online_url,
        onlineUserListener='usr'
    )
    img = qrcode.make(qr_config.json(by_alias=True, exclude_none=True))
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")

    base_64_mage = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return base_64_mage


def get_config_ui_elements(model=RootConfigModel) -> dict:
    scheme = jsonref.loads(model.schema_json(indent=2, ensure_ascii=True))
    elements = [v for v in scheme['definitions'].values() if v.get('properties', None)]
    result = {}
    containers = {}

    for el in elements:
        fields = {}
        title = el['title']

        for key, value in el['properties'].items():
            props = value.copy()
            props['required'] = key in (el.get('required') or [])
            props['hidden'] = key in ['type', 'PyFileData']

            fields[key] = ui_config.BaseField(text=value.get('title') or key, **props)
            if key == 'Elements':
                containers[title] = _get_elements_items(value)

        result[title] = ui_config.create_element(title, fields).dict(exclude_none=True)

    for key, value in containers.items():
        for item in value:
            element_type = ui_config.ElementType(parent=key, type='select', options=value, text='type')

            result[item]['type_'].append(element_type)

    return ui_config.convert_to_dict(result)


def _get_elements_items(value):
    result = []

    if value.get('items', None):
        if value['items'].get('oneOf', None):
            result = [element['title'] for element in value['items']['oneOf']]
        elif value['items'].get('anyOf', None):
            result = [element['title'] for element in value['items']['anyOf']]

    return result


def make_base64_from_file_path(file_path: str) -> Union[str, None]:
    with open(file_path, 'rb') as file:
        data = file.read()
        base64file = base64.b64encode(data).decode('utf-8')
        return base64file


def get_content_from_base64(base_64_str: str) -> str:
    return base64.b64decode(base_64_str).decode('utf-8')

def export_configuration_data(file_path: str, dir_to_save: str):
    file_path = pathlib.Path(file_path)
    dir_to_save = pathlib.Path(dir_to_save)
    path_to_config = dir_to_save / file_path.name
    path_to_project_config = pathlib.Path(dir_to_save / '.project_config.json')


    data_to_save = {}
    project_config_data = {}
    if file_path.exists() and dir_to_save.exists():
        with file_path.open(encoding='utf-8') as fp:
            raw_conf_data = json.load(fp)
            conf_data = RootConfigModel(**raw_conf_data)

        py_handlers = conf_data.client_configuration.py_handlers
        py_files = conf_data.client_configuration.py_files
        media_files = conf_data.client_configuration.media_file

        data_to_save[dir_to_save / 'handlers.py'] = base64.b64decode(py_handlers)
        project_config_data['handlers'] = './handlers.py'
        for item in py_files:
            data_to_save[dir_to_save / 'handlers' / f'{item.py_file_key}.py'] = (
                base64.b64decode(item.py_file_data)
            )
            project_config_data.setdefault(
                'modules', {})[item.py_file_key] = f'./{item.py_file_key}.py'

        for item in media_files:
            file_name = f'{item.media_file_key}.{item.media_file_ext}'
            data_to_save[dir_to_save / 'media_files' / file_name] = (
                base64.b64decode(item.media_file_data)
            )
            project_config_data.setdefault(
                'media_files', {})[item.media_file_key] = f'./{item.media_file_key}.{item.media_file_ext}'

        for path, data in data_to_save.items():
            if not path.parent.exists():
                path.parent.mkdir()
            with path.open('wb') as fp:
                fp.write(data)

        with path_to_config.open('w') as fp:
            json.dump(raw_conf_data, fp, ensure_ascii=False, indent=2)

        with path_to_project_config.open('w') as fp:
            json.dump(project_config_data, fp, ensure_ascii=False, indent=2)

    else:
        raise ValueError('Error: configuration file  or dir to export not exists')


class SQLQueryManager:
    def __init__(self, device_host, db_name, **kwargs):
        self.device_host = device_host
        self.db_name = db_name
        self.mode = 'SQLQueryText'
        self.port = '8095'
        self.query = ''
        self.params = ''

    def send_query(self, query: str, params='', **kwargs):
        self.query = query
        self.params = params
        result = {'error': '', 'content': '', 'data': None}
        try:
            response = requests.post(
                self.get_url(),
                headers={'Content-Type': 'Application/json; charset=utf-8'}
            )
            result['content'] = response.text
            if response.status_code == 200:
                result['data'] = self.parse_data(result['content'])
            else:
                result['error'] = str(response.status_code)

        except requests.exceptions.RequestException as e:
            result['error'] = 'Device connection error'
            result['content'] = str(e.args[0])

        return result

    @staticmethod
    def parse_data(content):
        content_data = content.splitlines()
        if len(content_data) > 1:
            return {
                'header': content_data[0],
                'data': content_data[1:]
            }

    def get_url(self):
        if self.device_host:
            return 'http://{}:{}/?mode={}&query={}&params={}&db_name={}'.format(
                self.device_host,
                self.port,
                self.mode,
                self.query,
                self.params,
                self.db_name
            )
        else:
            raise requests.exceptions.RequestException()


class RequestsManager:
    def __init__(self, host, mode, method, **kwargs):
        self.device_host = host
        self.mode = mode
        self.port = '8095'
        self.method = method
        self.method_type = 'listener' if self.mode == 'SyncCommand' else 'command'
        self.body = kwargs.get('body')

    def send_query(self, **kwargs):
        result = {'error': '', 'content': '', 'data': None}
        try:
            response = requests.post(
                self.get_url(),
                headers={'Content-Type': 'Application/json; charset=utf-8'}
            )
            result['content'] = response.text
            if response.status_code == 200:
                result['data'] = response.json()
            else:
                result['error'] = str(response.status_code)

        except requests.exceptions.RequestException as e:
            result['error'] = 'Device connection error'
            result['content'] = str(e.args[0])

        return result

    def get_url(self):
        if self.device_host:
            return 'http://{}:{}/?mode={}&{}={}'.format(
                self.device_host,
                self.port,
                self.mode,
                self.method_type,
                self.method,
            )
        else:
            raise requests.exceptions.RequestException()


class VersionError(Exception):
    pass
