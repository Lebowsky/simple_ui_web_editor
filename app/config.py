import os
import pathlib
import json
import sys

from easysettings import EasySettings


class UIOpenMode:
    NONE = 0
    CHROME = 1
    USER_DEFAULT = 2


# Frontend
# FRONTEND_ASSET_FOLDER = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'web')


# Argument-influenced configuration
ui_open_mode = UIOpenMode.CHROME


# Settings SimpleUI

def resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)


class Locale:
    def __init__(self, locale):
        self.locale = locale

    def get(self, key):
        return self.locale.get(key, key)


FRONTEND_ASSET_FOLDER = resource_path('app/web')
print(FRONTEND_ASSET_FOLDER)


class SimpleUISettings:
    def __init__(self):
        settings = EasySettings("uiconfigfile.conf")
        # _locale_filename = settings.get("locale_filename") or f'{pathlib.Path(__file__).resolve().parent}/en_locale.json'
        _locale_filename = settings.get("locale_filename") or f'{resource_path("app/en_locale.json")}'

        with open(_locale_filename, 'r', encoding='utf-8') as file:
            self.locale = Locale(json.load(file))


su_settings = SimpleUISettings()
