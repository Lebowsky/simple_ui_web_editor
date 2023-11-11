import platform

from tkinter import Tk
from tkinter.filedialog import askopenfilename, asksaveasfilename, askdirectory
from .utils import check_config_file


def ask_file(file_type):
    """ Ask the user to select a file """
    root = Tk()
    root.withdraw()
    root.wm_attributes('-topmost', 1)
    if (file_type is None) or (platform.system() == "Darwin"):
        file_path = askopenfilename(parent=root)
    else:
        file_mask_types = {
            'simple_ui': [('Simple UI files', '*.ui'), ('All files', '*')],
            'python': [('Python files', '*.py')],
            'project_config': [('Project config files', '*.json')],
            'json': [('Project config files', '*.json')],
        }

        if file_type in file_mask_types:
            file_types = file_mask_types[file_type]
        else:
            file_types = [('All files', '*')]

        file_path = askopenfilename(parent=root, filetypes=file_types)
    root.update()

    return file_path


def ask_save_file(file_type='simple_ui'):
    root = Tk()
    root.withdraw()
    root.wm_attributes('-topmost', 1)
    if file_type == 'simple_ui':
        file_types = [('Simple UI files', '*.ui')]
    else:
        file_types = [('All files', '*')]
    file_path: str = asksaveasfilename(parent=root, filetypes=file_types)
    root.update()

    if file_path:
        file_path = file_path if file_path.endswith('.ui') else f'{file_path}.ui'
        return {'file_path': file_path}


def ask_dir():
    root = Tk()
    root.withdraw()
    root.wm_attributes('-topmost', 1)

    dir_path = askdirectory()

    if dir_path:
        return {'path': dir_path}
