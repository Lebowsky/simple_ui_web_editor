import os
import unittest

from app import utils


class TestsProjectConfigManager(unittest.TestCase):

    def test_can_create_config_on_ui_config_data(self):
        work_dir = 'C:\\Projects/python\\simple\\keep'
        data = {'ClientConfiguration': {
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
            ]
        }}

        sut = utils.ProjectConfigManager(work_dir)
        sut.create_config_data(data)

        expected = {
            'handlers': './main.py',
            'modules': {
                'database_init_queryes': './database_init_queryes.py',
                'db_services': './db_services.py',
                'hs_services': './hs_services.py',
                'ui_global': './ui_global.py',
            }
        }
        actual = sut.config_data

        self.assertTrue(actual)
        self.assertEqual(expected['handlers'], actual['handlers'])

        self.assertTrue(actual.get('modules'))
        self.assertEqual(expected['modules']['database_init_queryes'], actual['modules']['database_init_queryes'])
        self.assertEqual(expected['modules']['db_services'], actual['modules']['db_services'])
        self.assertEqual(expected['modules']['hs_services'], actual['modules']['hs_services'])
        self.assertEqual(expected['modules']['ui_global'], actual['modules']['ui_global'])

    def test_can_get_data_from_config_with_rel_paths(self):
        work_dir = 'C:\\Projects/python\\simple'
        data = {
            'handlers': './main.py',
            'modules': {
                'database_init_queryes': './database_init_queryes.py',
                'db_services': './db_services.py',
                'hs_services': './hs_services.py',
                'ui_global': './ui_global.py',
            }
        }

        ui_config_data = {'ClientConfiguration': {
            'PyFiles': [
                {'PyFileKey': 'database_init_queryes'},
                {'PyFileKey': 'db_services'},
                {'PyFileKey': 'hs_services'},
                {'PyFileKey': 'ui_global'},
            ]
        }}

        expected = {
            'pyHandlersPath': 'C:\\Projects\\python\\simple\\main.py',
            'PyFiles': [
                {'file_path': 'C:\\Projects\\python\\simple\\database_init_queryes.py',
                 'PyFileKey': 'database_init_queryes'},
                {'file_path': 'C:\\Projects\\python/simple\\db_services.py',
                 'PyFileKey': 'db_services'},
                {'file_path': 'C:\\Projects\\python\\simple\\hs_services.py',
                 'PyFileKey': 'hs_services'},
                {'file_path': 'C:\\Projects/python\\simple\\ui_global.py',
                 'PyFileKey': 'ui_global'},
                {'file_path': 'C:\\Projects/python\\simple\\keep\\ui_global.py',
                 'PyFileKey': 'ui_global'},
            ]
        }

        sut = utils.ProjectConfigManager(work_dir)
        sut.config_data = data

        sut.fill_data_from_config(ui_config_data)
        actual = ui_config_data['ClientConfiguration']

        self.assertTrue(actual.get('pyHandlersPath'))
        self.assertEqual(expected['pyHandlersPath'], actual['pyHandlersPath'])

        self.assertTrue(actual['PyFiles'])
        self.assertEqual(expected['PyFiles'][0]['file_path'], expected['PyFiles'][0]['file_path'])
        self.assertEqual(expected['PyFiles'][1]['file_path'], expected['PyFiles'][1]['file_path'])
        self.assertEqual(expected['PyFiles'][2]['file_path'], expected['PyFiles'][2]['file_path'])
        self.assertEqual(expected['PyFiles'][3]['file_path'], expected['PyFiles'][3]['file_path'])
        self.assertEqual(expected['PyFiles'][4]['file_path'], expected['PyFiles'][4]['file_path'])
