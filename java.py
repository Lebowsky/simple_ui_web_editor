import json
from app.config import resource_path


def jclass(cls_name):
    if cls_name == 'ru.travelfood.simple_ui.NoSQL':
        return NoSQL


class NoSQL:
    def __init__(self, database: str):
        if database:
            self.database = database
            self.database_path = resource_path(f'{database}.json')
            with open(self.database_path, 'w', encoding='utf-8') as f:
                json.dump({}, f, ensure_ascii=True, indent=4)
        else:
            raise ValueError('Database name must be specified ')

    def get(self, key: str):
        with open(self.database_path, encoding='utf-8') as f:
            return json.load(f).get(key)

    def put(self, key: str, value):
        with open(self.database_path, 'r+', encoding='utf-8') as f:
            data = json.load(f).get(key)
            data[key] = value
            json.dump(data)

    def getallkeys(self) -> dict:
        with open(self.database_path, encoding='utf-8') as f:
            return json.load(f)
