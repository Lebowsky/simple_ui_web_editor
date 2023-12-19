from . import root_config


def get_new_configuration():
    return root_config.RootConfigModel().dict(by_alias=True, exclude_none=True)
