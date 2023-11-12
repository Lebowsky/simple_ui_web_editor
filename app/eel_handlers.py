from . import models
from . import utils

ui_config_manager: utils.UiConfigManager = None


def get_configuration_from_file(file_path, convert_version=False):
    global ui_config_manager
    try:
        if convert_version is False:
            ui_config_manager = utils.UiConfigManager(file_path=file_path)
            ui_config_manager.init_config()

        result = {
            'file_path': ui_config_manager.file_path,
            'ui_config_data': ui_config_manager.get_config_data(convert_version=convert_version)
        }
    except utils.InitUiConfigError as e:
        result = e.json()
    return result


def get_new_configuration():
    return models.get_new_configuration()


def save_configuration(config_data, file_path):
    global ui_config_manager
    if ui_config_manager is None:
        ui_config_manager = utils.UiConfigManager(file_path)

    return ui_config_manager.save_configuration(config_data)


def save_project_config(data, work_dir):
    manager = utils.ProjectConfigManager(work_dir)
    manager.save_project_config_to_file(data)


def get_config_ui_elements():
    manager = utils.UiElementsConfigManager()
    return manager.get_config_ui_elements()
