import { StorageService } from "../adapters/storageService";
import { ConfigParser } from "../utils/configParser";
import { configurationWithOneProcessAndOneOperation, configurationWithoutProcesses, emptyConfig, rootConfig } from "./configurationSamples/configSamples";


describe('testing ConfigParser', () => {
  let sut: ConfigParser
  beforeEach(() => {
    const storage = new StorageService()
    sut = new ConfigParser(storage)
  })

  test('can create data from empty config', () => {
    const expected = { ClientConfiguration: {} }

    sut.parseJsonData(emptyConfig)
    const actual = sut.getConfigurationJson()

    expect(expected).toStrictEqual(actual)
  })

  test('can create data from config with root elements', () => {
    const expected = rootConfig

    sut.parseJsonData(rootConfig)
    const actual = sut.getConfigurationJson()

    expect(expected).toStrictEqual(actual)
  })

  test('can create storage from config without processes', () => {
    const expected = configurationWithoutProcesses

    sut.parseJsonData(configurationWithoutProcesses)
    const actual = sut.getConfigurationJson()

    expect(expected).toStrictEqual(actual)
  })

  test('can create storage from config with one process and one operation', () => {
    const expected = configurationWithOneProcessAndOneOperation
    
    sut.parseJsonData(configurationWithOneProcessAndOneOperation)
    const actual = sut.getConfigurationJson()

    expect(expected).toStrictEqual(actual)
  })
})

