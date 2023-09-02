import io
import os
import socket
import base64
import glob
import pathlib
import requests
import json
import jsonref
from eel import chrome
from pydantic import ValidationError
import qrcode


from .models import ui_config, project_config
from .models.handlers import Handler
from .models.root_config import RootConfigModel, QRCodeConfig

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
    py_files = data['ClientConfiguration'].get('PyFiles', [])
    for item in py_files:
        if item.get('file_path') and not os.path.exists(item['file_path']):
            item['file_path'] = ''

        file_path = os.path.join(path, '{}.py'.format(item['PyFileKey']))
        if os.path.exists(file_path):
            item['file_path'] = file_path

    file_path = data['ClientConfiguration'].get('pyHandlersPath')
    if file_path and not os.path.exists(file_path):
        data['ClientConfiguration']['pyHandlersPath'] = ''

    file_path = os.path.join(path, 'main.py')
    if os.path.exists(file_path):
        data['ClientConfiguration']['pyHandlersPath'] = file_path



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


def get_qr_code_config():
    host = socket.gethostbyname(socket.gethostname())
    port = 5000
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
            fields[key] = ui_config.BaseField(text=value.get('title') or key, **value)
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


def make_base64_from_file(file_path: str) -> str:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as file:
            data = file.read()
            base64file = base64.b64encode(data.encode('utf-8')).decode('utf-8')
            return base64file


def get_content_from_base64(base_64_str: str) -> str:
    return base64.b64decode(base_64_str).decode('utf-8')


def update_python_modules(new_modules: dict):
    if new_modules:
        global python_modules
        python_modules = new_modules


def get_python_modules():
    return python_modules


class ProjectConfig:
    def __init__(self, config_data):
        self.config_data = project_config.ConfigData(**config_data)
        self.default_handlers = 'handlers'
        self.default_external_modules = 'external_modules'
        self.default_media_data = 'media_data'
        self.default_config_name = 'sui_config.json'
        self.config = None

    def get_config(self):
        if os.path.exists(self.config_data.work_dir):
            self._init_config()
            self._create_folders()
            self._save_project_files()
            return self._create_config().dict(by_alias=True)

    def _get_config_file_path(self):
        file_paths = [
            self.config_data.file_path,
            os.path.join(self.config_data.work_dir, self.default_config_name)
        ]

        for file_path in file_paths:
            if os.path.exists(file_path):
                return file_path

    def _save_config_file(self, file_name):
        file_path = os.path.join(
            self.config_data.work_dir, file_name)

        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(self.config.dict(by_alias=True), f, ensure_ascii=False, indent=2)
            self.file_path = file_path

    def _init_new(self):
        self.config = project_config.ProjectConfig(
            py_handlers=f'{self.default_handlers}/*.py',
            py_files=f'{self.default_external_modules}/*.py',
            media_files=f'{self.default_media_data}/*.*'
        )
        self._save_config_file(self.default_config_name)

    def _init_config(self):
        file_path = self._get_config_file_path()

        if file_path:
            self.file_path = file_path
            with open(file_path, encoding='utf-8') as f:
                self.config = project_config.ProjectConfig.parse_raw(f.read())
        else:
            self._init_new()

    def _create_folders(self):
        for key, value in self.config.dict().items():
            if isinstance(value, list):
                for item in value:
                    dir_name = os.path.join(self.config_data.work_dir, os.path.dirname(item))

                    if dir_name and not os.path.exists(dir_name):
                        os.makedirs(dir_name)
            else:
                dir_name = os.path.join(self.config_data.work_dir, os.path.dirname(value))
                if dir_name and not os.path.exists(dir_name):
                    os.makedirs(dir_name)

    def _get_files_locations(self) -> list:
        files_locations = []

        if self.config_data.py_handlers:
            files_locations.append({
                'path': os.path.join(
                    self.config_data.work_dir,
                    self.default_handlers,
                    'current_handlers.py'),
                'data': self.config_data.py_handlers
            })

        for item in self.config_data.py_files:
            files_locations.append({
                'path': os.path.join(
                    self.config_data.work_dir,
                    self.default_external_modules,
                    f'{item.py_file_key}'),
                'data': item.py_file_data
            })

        for item in self.config_data.media_files:
            files_locations.append({
                'path': os.path.join(
                    self.config_data.work_dir,
                    self.default_media_data,
                    f'{item.media_file_key}.{item.media_file_ext}'),
                'data': item.media_file_data
            })

        return files_locations

    def _save_project_files(self):
        files_locations = self._get_files_locations()

        for item in files_locations:
            content = get_content_from_base64(item['data'])
            with open(item['path'], 'w', encoding='utf-8') as f:
                f.write(content)

    def _create_config(self):
        handlers = glob.glob(
            os.path.join(self.config_data.work_dir, self.config.py_handlers),
            recursive=True
        )

        max_len = max([len(item) for item in handlers])
        handlers_content = ''
        for path in handlers:
            delimiter = self._get_delimiter(path, max_len)
            with open(path, encoding='utf-8') as f:
                handlers_content += f'\n{delimiter}\n\n{f.read()}\n'

        py_files = []
        external_modules = self._get_glob_data(self.config.py_files)
        for path in external_modules:
            py_files.append({
                'py_file_key': os.path.basename(path),
                'py_file_data': make_base64_from_file(path),
                'file_path': path
            })

        media_files = []
        media_data = self._get_glob_data(self.config.media_files)
        for data in media_data:
            path = pathlib.Path(data)
            media_files.append({
                'media_file_data': make_base64_from_file(data),
                'media_file_key': path.stem,
                'media_file_ext': path.suffix[1:]
            })

        result = project_config.ConfigData(
            work_dir=self.config_data.work_dir,
            file_path=self.file_path,
            py_handlers=base64.b64encode(handlers_content.encode('utf-8')).decode('utf-8'),
            py_files=py_files,
            media_files=media_files,
        )

        return result

    def _get_glob_data(self, path):
        return glob.glob(
            os.path.join(self.config_data.work_dir, path),
            recursive=True
        )

    def _get_delimiter(self, path, max_len):
        gap_len = (max_len - len(path)) // 2
        indents = ['###' + ' ' * gap_len, ' ' * gap_len + '###']

        max_len = max_len + 6

        delimiter = path.join(indents)
        frame = '=' * max_len
        frame = f'#{frame[1:-1]}#'

        return '\n'.join([frame, delimiter, frame])


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


class VersionError(Exception):
    pass
