import platform

from tkinter import Tk
from tkinter.filedialog import askopenfilename, asksaveasfilename
from utils import check_config_file


def ask_file(file_type):
    """ Ask the user to select a file """
    root = Tk()
    root.withdraw()
    root.wm_attributes('-topmost', 1)
    if (file_type is None) or (platform.system() == "Darwin"):
        file_path = askopenfilename(parent=root)
    else:
        if file_type == 'simple_ui':
            file_types = [('Simple UI files', '*.ui')]
        else:
            file_types = [('All files', '*')]
        file_path = askopenfilename(parent=root, filetypes=file_types)
    root.update()

    result = check_config_file(file_path)
    return result


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

    file_path = file_path if file_path.endswith('.ui') else f'{file_path}.ui'
    return {'file_path': file_path}
