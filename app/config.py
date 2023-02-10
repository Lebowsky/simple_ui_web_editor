import os
import json
from easysettings import EasySettings


class UIOpenMode:
    NONE = 0
    CHROME = 1
    USER_DEFAULT = 2


# Frontend
FRONTEND_ASSET_FOLDER = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'web')

# Argument-influenced configuration
ui_open_mode = UIOpenMode.CHROME


# Settings SimpleUI

class Locale:
    def __init__(self, locale):
        self.locale = locale

    def get(self, key):
        return self.locale.get(key, key)


class SimpleUISettings:
    def __init__(self):
        settings = EasySettings("uiconfigfile.conf")
        _locale_filename = settings.get("locale_filename") or 'en_locale.json'

        with open(_locale_filename, 'r', encoding='utf-8') as file:
            self.locale = Locale(json.load(file))


su_settings = SimpleUISettings()
