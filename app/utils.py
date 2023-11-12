import io
import os
import logging
import socket
import base64
import pathlib
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
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


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


def update_python_modules(new_modules: dict):
    if new_modules:
        global python_modules
        python_modules = new_modules


def get_python_modules():
    return python_modules


def check_file_paths(data: dict, path: str):
    pass
    # project_config_data = get_data_from_project_config(path)

    # py_files = data['ClientConfiguration'].get('PyFiles', [])
    # for item in py_files:
    #     if item.get('file_path') and not os.path.exists(item['file_path']):
    #         item['file_path'] = ''
    #
    #     folder_path = (project_config_data.get('modules', {}).get(item['PyFileKey']))
    #     file_path = pathlib.Path(path, folder_path) or pathlib.Path(item.get('file_path', ''))
    #
    #     if file_path.exists():
    #         item['file_path'] = str(file_path)
    #
    # file_path = (
    #         pathlib.Path(path, project_config_data.get('handlers', ''))
    #         or pathlib.Path(data['ClientConfiguration'].get('pyHandlersPath'))
    # )
    #
    # if file_path and not file_path.exists():
    #     data['ClientConfiguration']['pyHandlersPath'] = ''
    #
    # if file_path.exists():
    #     data['ClientConfiguration']['pyHandlersPath'] = file_path


def save_base64_data(ui_configuration):
    file_path = ui_configuration['ClientConfiguration'].get('pyHandlersPath')
    if file_path:
        ui_configuration['ClientConfiguration']['PyHandlers'] = make_base64_from_file(file_path)

    py_files = ui_configuration['ClientConfiguration'].get('PyFiles', [])
    for item in py_files:
        if item.get('file_path'):
            item['PyFileData'] = make_base64_from_file(item['file_path'])


def make_base64_from_file(file_path: str) -> str:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as file:
            data = file.read()
            base64file = base64.b64encode(data.encode('utf-8')).decode('utf-8')
            return base64file


def validate_configuration_model(ui_configuration: dict) -> dict:
    try:
        return RootConfigModel(**ui_configuration).dict(by_alias=True, exclude_none=True)
    except ValidationError as e:
        raise e
    except Exception as e:
        raise e


def get_qr_code_config():
    host = socket.gethostbyname(socket.gethostname())
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


def get_content_from_base64(base_64_str: str) -> str:
    return base64.b64decode(base_64_str).decode('utf-8')


class UiConfigManager:
    def __init__(self, file_path):
        self.file_path = str(pathlib.Path(file_path))
        self.config_data = {}
        self.error = {}
        self.unsupported_version = False

    def init_config(self):
        if self._read_config() and self._check_config():
            self.config_data = RootConfigModel(**self.config_data).dict(by_alias=True, exclude_none=True)
        if self.error:
            logger.error(f'Init config error as cause: {self.error}')
            raise InitUiConfigError(json.dumps(dict(**{'file_path': self.file_path}, **self.error)))

    def get_config_data(self, convert_version=False):
        if convert_version and self._is_unsupported_version_config():
            self._convert_config_version()
        return RootConfigModel(**self.config_data).dict(by_alias=True, exclude_none=True)

    def set_config_data(self, config_data):
        self.config_data = config_data

    def save_configuration(self, config_data):
        self.set_config_data(config_data)
        if self.save_config_to_file():
            return {'result': 'success'}
        else:
            return {
                'result': 'error',
                'msg': json.dumps(self.error)
            }

    def save_config_to_file(self):
        result = False
        try:
            config = RootConfigModel(**self.config_data)
            with open(self.file_path, 'w', encoding="utf-8") as f:
                json.dump(
                    config.dict(by_alias=True, exclude_none=True),
                    f,
                    ensure_ascii=False,
                    indent=4,
                    separators=(',', ': ')
                )
            result = True
        except ValidationError as e:
            self.error = {'error': 'ValidationError', 'message': e.json()}
        except FileExistsError as e:
            self.error = {'error': 'FileExistsError', 'message': self.file_path}
        except json.JSONDecodeError as e:
            self.error = {'error': 'JSONDecodeError', 'message': str(e)}
        except Exception as e:
            self.error = {'error': 'UnknownError', 'message': str(e)}

        return result

    def _read_config(self):
        result = False
        try:
            with open(self.file_path, encoding='utf-8') as f:
                self.config_data = json.load(f)
                result = True
        except json.JSONDecodeError as e:
            self.error = {'error': 'JSONDecodeError', 'message': str(e)}
        except FileNotFoundError as e:
            self.error = {'error': 'FileNotFoundError', 'message': self.file_path}
        except Exception as e:
            self.error = {'error': 'UnknownError', 'message': str(e)}

        return result

    def _check_config(self):
        result = False
        try:
            RootConfigModel(**self.config_data)
            result = self._check_config_version()
        except ValidationError as e:
            self.error = {'error': 'ValidationError', 'message': e.json()}
        except ValueError as e:
            self.error = {'error': 'ValueError', 'message': str(e)}
        except VersionError as e:
            self.error = {'error': 'VersionError', 'message': str(e)}
        except Exception as e:
            self.error = {'error': 'UnknownError', 'message': str(e)}

        return result

    def _check_config_version(self):
        if self._is_unsupported_version_config():
            self.unsupported_version = True
            raise VersionError('Unsupported configuration version')
        return True

    def _is_unsupported_version_config(self):
        for item in ['DefServiceConfiguration', 'OnlineServiceConfiguration']:
            if item in self.config_data.keys() and self.config_data[item]:
                return True

        check_keys = ['DefOnCreate', 'DefOnInput', 'DefOnlineOnCreate', 'DefOnlineOnInput']

        for process in self.config_data['ClientConfiguration']['Processes']:
            if not process.get('Operations'):
                continue
            for operation in process['Operations']:
                for item in check_keys:
                    if item in operation.keys() and operation[item]:
                        return True

    def _convert_config_version(self):
        check_keys = {
            'DefOnCreate': {'event': 'onStart', 'action': 'run', 'type': 'python'},
            'DefOnInput': {'event': 'onInput', 'action': 'run', 'type': 'python'},
            'DefOnlineOnCreate': {'event': 'onStart', 'action': 'run', 'type': 'online'},
            'DefOnlineOnInput': {'event': 'onInput', 'action': 'run', 'type': 'online'}
        }

        for process in self.config_data['ClientConfiguration']['Processes']:
            if not process.get('Operations'):
                continue

            for operation in process['Operations']:
                handlers = operation.get('Handlers', [])
                for item in check_keys:
                    if item in operation.keys() and operation[item]:
                        handlers.append(
                            Handler(method=operation[item], **check_keys[item]))
                operation['Handlers'] = handlers


class UiElementsConfigManager:

    def get_config_ui_elements(self, model=RootConfigModel) -> dict:
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
                    containers[title] = self._get_elements_items(value)

            result[title] = ui_config.create_element(title, fields).dict(exclude_none=True)

        for key, value in containers.items():
            for item in value:
                element_type = ui_config.ElementType(parent=key, type='select', options=value, text='type')

                result[item]['type_'].append(element_type)

        return ui_config.convert_to_dict(result)

    @staticmethod
    def _get_elements_items(value):
        result = []

        if value.get('items', None):
            if value['items'].get('oneOf', None):
                result = [element['title'] for element in value['items']['oneOf']]
            elif value['items'].get('anyOf', None):
                result = [element['title'] for element in value['items']['anyOf']]

        return result


class ProjectConfigManager:
    def __init__(self, work_dir, **kwargs):
        self.work_dir = work_dir
        self.file_name = kwargs.get('file_name') or 'sui_config.json'
        self.file_path = pathlib.Path(self.work_dir, self.file_name)
        self.config_data = {}

    def save_project_config_to_file(self, ui_config_data):
        self.create_config_data(ui_config_data)
        self._save_config_data_to_file()

    def create_config_data(self, ui_config_data: dict):
        files_data = ui_config_data.get('ClientConfiguration')
        if not files_data:
            return

        result = {}
        handlers_path = files_data.get('pyHandlersPath')
        py_files = files_data.get('PyFiles')

        if handlers_path:
            result['handlers'] = self._get_relpath(handlers_path)

        if py_files:
            modules = {
                item['PyFileKey']: self._get_relpath(item['file_path'])
                for item in py_files if item.get('file_path')
            }
            result['modules'] = modules
        self.config_data = result

    def fill_config_data_from_file(self, ui_config_data):
        self._load_config_data_from_file()
        self.fill_data_from_config(ui_config_data)

    def fill_data_from_config(self, ui_config_data):
        files_data = ui_config_data.get('ClientConfiguration')
        if not self.config_data or not files_data:
            return

        files_data['pyHandlersPath'] = self._get_absolute_path(self.config_data.get('handlers', ''))

        modules = self.config_data.get('modules')

        if files_data.get('PyFiles') and modules:
            for item in files_data.get('PyFiles', []):
                item['file_path'] = self._get_absolute_path(
                    modules.get(item.get('PyFileKey', ''), item.get('file_path', '')))



    def _save_config_data_to_file(self):
        try:
            with open(self.file_path, 'w', encoding='utf-8') as f:
                json.dump(self.config_data, f, ensure_ascii=False, indent=2)
                return {'result': 'success'}
        except json.JSONDecodeError as e:
            return {
                'result': 'error',
                'msg': str(e)
            }

    def _get_relpath(self, full_path):
        full_path = str(pathlib.Path(full_path))
        prefix = str(pathlib.Path(self.work_dir))
        return f'.\\{os.path.relpath(full_path, os.path.commonprefix([full_path, prefix]))}'

    def _load_config_data_from_file(self):
        if self.file_path.exists():
            with open(self.file_path) as f:
                try:
                    project_conf = json.load(f)
                except Exception as e:
                    project_conf = {}
                    logger.error(str(e))

            self.config_data = project_conf

    def _get_absolute_path(self, *args):
        return str(pathlib.Path(self.work_dir, *args))


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


class InitUiConfigError(Exception):
    def json(self):
        return json.loads(str(self))


class VersionError(Exception):
    pass


class CheckUiConfigError(Exception):
    pass
