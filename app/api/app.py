from fastapi import FastAPI

from ui import get_current_file_path
from utils import get_config_from_file

app = FastAPI()


@app.get('/get_conf')
async def get_config():
    file_path = await get_current_file_path()
    config = get_config_from_file(file_path)
    return config
