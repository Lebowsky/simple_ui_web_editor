from typing import List, Union
from pydantic import BaseModel, Field

from .root_config import PyFilesModel, MediaFileModel


class ConfigData(BaseModel):
    work_dir: str = Field(alias='workDir')
    file_path: str = Field(alias='filePath')
    py_handlers: str = Field(alias='PyHandlers')
    py_files: List[PyFilesModel] = Field(alias='PyFiles')
    media_files: List[MediaFileModel] = Field(alias='Mediafile')

    class Config:
        allow_population_by_field_name = True


class ProjectConfig(BaseModel):
    py_handlers: Union[str, List[str]] = Field(alias='PyHandlers')
    py_files: Union[str, List[str]] = Field(alias='PyFiles')
    media_files: Union[str, List[str]] = Field(alias='Mediafile')

    class Config:
        allow_population_by_field_name = True


