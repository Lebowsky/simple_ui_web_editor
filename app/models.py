from typing import List, Optional
import uuid

from pydantic import BaseModel
from config import su_settings


class BaseConfigModel(BaseModel):
    pass


class ConfigurationSettingsModel(BaseConfigModel):
    uid: str = uuid.uuid4().hex


class OperationsModel(BaseConfigModel):
    type: str = 'Operation'
    Name: str = su_settings.locale.get('new_screen')
    Timer: bool = False
    hideToolBarScreen: bool = False
    noScroll: bool = False
    onlineOnAfterStart: Optional[bool] = False
    handleKeyUp: bool = False
    noConfirmation: bool = False
    hideBottomBarScreen: bool = False
    onlineOnStart: bool = False
    send_when_opened: bool = False
    send_after_opened: Optional[bool] = False
    onlineOnInput: bool = False
    DefOnlineOnCreate: str = ""
    DefOnlineOnInput: str = ""
    DefOnCreate: str = ""
    DefOnInput: str = ""
    Elements = []


class ProcessesModel(BaseConfigModel):
    type: str = 'Process'
    ProcessName: str = su_settings.locale.get('new_process')
    PlanFactHeader: str = su_settings.locale.get('plan_fact')
    DefineOnBackPressed: bool = False
    hidden: bool = False
    login_screen: bool = False
    SC: bool = False
    Operations: List[OperationsModel]


class ClientConfigurationModel(BaseConfigModel):
    ConfigurationName: str = su_settings.locale.get('new_configuration')
    ConfigurationDescription: str = su_settings.locale.get('new_configuration_decription')
    ConfigurationVersion: str = '0.0.1'
    Processes: List[ProcessesModel] = [ProcessesModel(Operations=[OperationsModel()])]
    ConfigurationSettings: ConfigurationSettingsModel = ConfigurationSettingsModel()
    ConfigurationTags: str = ''


class RootConfigModel(BaseConfigModel):
    ClientConfiguration: ClientConfigurationModel = ClientConfigurationModel()


class QRCodeConfig(BaseModel):
    RawConfigurationURL: str
    RawConfigurationServiceAuth: str = ''
    RawConfigurationServiceON: bool = True
    OnlineSplitMode: bool = True
