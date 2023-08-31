from typing import Optional
from enum import Enum

from pydantic import BaseModel, Field

class TypeRecognition(str, Enum):
    text: str = 'Text'
    number: str = 'Number'
    date: str = 'Date'
    plate_number: str = 'PlateNumber'

class RecognitionTemplate(BaseModel):
    name: str = 'New recognition template'
    type_recognition: TypeRecognition = Field(default=TypeRecognition.number.value, alias='TypeRecognition')
    number_recognition: bool = Field(default=False, alias='NumberRecognition')
    date_recognition: bool = Field(default=False, alias='DateRecognition')
    plate_number_recognition: bool = Field(default=False, alias='PlateNumberRecognition')
    mesure_qty: Optional[str]
    min_freq: Optional[str]
    min_length: Optional[str]
    max_length: Optional[str]
    query: Optional[str]
    values_list: Optional[str]
    control_field: Optional[str]
    result_field: Optional[str]
    result_var: Optional[str]

    class Config:
        title = 'RecognitionTemplates'