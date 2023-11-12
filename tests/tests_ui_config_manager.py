import os.path
import json
import unittest

from app import utils


class TestUiConfigManager(unittest.TestCase):
    def test_can_read_config_file(self):
        file_path = os.path.abspath('./tests/tests_files/ui_config_success.json')
        manager = utils.UiConfigManager(file_path=file_path)
        manager.init_config()
        self.assertFalse(manager.error)

    def test_can_not_read_config_file_with_file_not_found_error(self):
        file_path = os.path.abspath('./tests/tests_files/not_found.json')
        expect = {'error': 'FileNotFoundError', 'message': file_path}

        manager = utils.UiConfigManager(file_path=file_path)
        with self.assertRaises(utils.InitUiConfigError) as context:
            manager.init_config()

        actual = json.loads(str(context.exception))

        self.assertTrue(actual)
        self.assertEqual(actual['error'], expect['error'])
        self.assertEqual(actual['message'], expect['message'])

    def test_can_not_read_config_file_with_json_decode_error(self):
        file_path = os.path.abspath('./tests/tests_files/ui_config_json_error.json')
        expect = {'error': 'JSONDecodeError', 'message': 'Extra data: line 1 column 3 (char 2)'}

        manager = utils.UiConfigManager(file_path=file_path)
        with self.assertRaises(utils.InitUiConfigError) as context:
            manager.init_config()

        actual = json.loads(str(context.exception))

        self.assertTrue(actual)
        self.assertEqual(actual['error'], expect['error'])
        self.assertEqual(actual['message'], expect['message'])

    def test_must_check_config_failed_with_version_error(self):
        file_path = os.path.abspath('./tests/tests_files/ui_config_version_error.json')
        expect = {'error': 'VersionError', 'message': 'Unsupported configuration version'}

        manager = utils.UiConfigManager(file_path=file_path)
        with self.assertRaises(utils.InitUiConfigError) as context:
            manager.init_config()

        actual = json.loads(str(context.exception))

        self.assertTrue(actual)
        self.assertEqual(expect['error'], actual['error'])
        self.assertEqual(expect['message'], actual['message'])

    def test_must_check_config_failed_with_validation_error(self):
        file_path = os.path.abspath('./tests/tests_files/ui_config_validation_error.json')

        manager = utils.UiConfigManager(file_path=file_path)
        with self.assertRaises(utils.InitUiConfigError) as context:
            manager.init_config()

        actual = json.loads(str(context.exception))

        self.assertTrue(actual)
        self.assertEqual('ValidationError', actual['error'])
