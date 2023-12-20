import os
import base64

def make_base64_from_file(file_path: str) -> str:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as file:
            data = file.read()
            base64file = base64.b64encode(data.encode('utf-8')).decode('utf-8')
            return base64file