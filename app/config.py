import os
import json
import sys

from easysettings import EasySettings


class UIOpenMode:
    NONE = 0
    CHROME = 1
    USER_DEFAULT = 2


# Argument-influenced configuration
ui_open_mode = UIOpenMode.CHROME
app_server_host = '0.0.0.0'
app_server_port = 5000

def get_resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)


FRONTEND_ASSET_FOLDER = get_resource_path('app/web')


class Locale:
    def __init__(self, locale):
        self.locale = locale

    def get(self, key):
        return self.locale.get(key, key)


class SimpleUISettings:
    def __init__(self):
        settings = EasySettings(get_resource_path("app/uiconfigfile.conf"))

        _locale_filename = (
                get_resource_path(f'app/{settings.get("locale_filename")}')
                or get_resource_path("app/en_locale.json")
        )

        with open(_locale_filename, 'r', encoding='utf-8') as file:
            self.locale = Locale(json.load(file))


su_settings = SimpleUISettings()
