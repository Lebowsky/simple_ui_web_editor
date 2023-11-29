import unittest
from app import utils


class TestUtils(unittest.TestCase):
    def test_can_get_from_difference_paths_project_config(self):
        expect = {
            'handlers': './main.py',
            'modules': {
                'database_init_queryes': './database_init_queryes.py',
                'db_services': './db_services.py',
                'hs_services': './hs_services.py',
                'ui_global': './ui_global.py',
            }
        }
        data = {
            'pyHandlersPath': 'C:\\Projects/python\\simple\\keep/main.py',
            'PyFiles': [
                {'file_path': 'C:\\Projects\\python\\simple/keep\\database_init_queryes.py',
                 'PyFileKey': 'database_init_queryes'},
                {'file_path': 'C:\\Projects\\python/simple\\keep\\db_services.py',
                 'PyFileKey': 'db_services'},
                {'file_path': 'C:/Projects\\python\\simple\\keep\\hs_services.py',
                 'PyFileKey': 'hs_services'},
                {'file_path': 'C:\\Projects/python\\simple\\keep\\ui_global.py',
                 'PyFileKey': 'ui_global'},
            ],
        }
        actual = utils.create_project_config_data(data, 'C:/Projects\\python\\simple\\keep\\')
        self.assertEqual(expect['handlers'], actual['handlers'])
        self.assertEqual(expect['modules']['database_init_queryes'], actual['modules']['database_init_queryes'])
        self.assertEqual(expect['modules']['db_services'], actual['modules']['db_services'])
        self.assertEqual(expect['modules']['hs_services'], actual['modules']['hs_services'])
        self.assertEqual(expect['modules']['ui_global'], actual['modules']['ui_global'])

    def test_can_get_config_from_not_handlers_path_data(self):
        expect = {
            'modules': {
                'database_init_queryes': './database_init_queryes.py',
            }
        }

        data = {
            'PyFiles': [
                {'file_path': 'C:\\Projects\\python\\simple/keep\\database_init_queryes.py',
                 'PyFileKey': 'database_init_queryes'},
            ]
        }

        actual = utils.create_project_config_data(data, 'C:/Projects\\python\\simple\\keep\\')

        self.assertIsNone(actual.get('handlers'))
        self.assertEqual(expect['modules']['database_init_queryes'], actual['modules']['database_init_queryes'])

    def test_can_get_config_from_not_modules_path_data(self):
        expect = {
            'handlers': './main.py',
        }

        data = {
            'pyHandlersPath': 'C:\\Projects/python\\simple\\keep/main.py',
            'PyFiles': [
                {'PyFileKey': 'database_init_queryes'},
            ]
        }

        actual = utils.create_project_config_data(data, 'C:/Projects\\python\\simple\\keep\\')

        self.assertTrue(actual.get('handlers'))
        self.assertTrue(actual.get('handlers'), expect['handlers'])
        self.assertFalse(expect.get('modules'))
