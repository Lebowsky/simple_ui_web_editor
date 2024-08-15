import { StorageService } from "../adapters/storageService"
import { ConfigManager } from "../serviceLayer/configManager"
import { configurationWithOneProcessAndOneOperation } from "./configurationSamples/configSamples"

describe('testing ConfigManager', () => {
  let sut: ConfigManager
  beforeEach(() => {
    const storage = new StorageService()
    sut = new ConfigManager(storage)
  })

  test('can init manager from config data', () => {
    sut.init(configurationWithOneProcessAndOneOperation)
  })
})