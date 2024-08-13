import { contextTypes, StorageService } from "../adapters/storageService";
import { newConfiguration } from "../data/newConfig";


describe('testing StorageService', () => {
  test('can create storage with json data and make json', () => {
    const expected = newConfiguration
    const sut: StorageService = new StorageService(newConfiguration.ClientConfiguration)
    const actual = sut.getConfigurationJson()
    expect(actual).toStrictEqual(expected)
  })

  test('can get item by id', () => {
    const sut: StorageService = new StorageService(newConfiguration.ClientConfiguration)
    const processes = sut.getItemsByType(contextTypes.processes)
    const item = processes.pop()

    expect(sut.get(item.id, item.contextType)).toBeTruthy()
    expect(sut.get(-1, item.contextType)).toBeFalsy()
  })

  test('can create new item', () => {
    const sut: StorageService = new StorageService(newConfiguration.ClientConfiguration)
    const item = {
      parentId: 0,
      contextType: contextTypes.processes,
      content: {}
    }

    expect(sut.getItemsByType(contextTypes.processes).length).toBe(1)
    const itemId = sut.create(item)
    expect(itemId).toBeTruthy()
    expect(sut.getItemsByType(contextTypes.processes).length).toBe(2)
    expect(sut.get(itemId, contextTypes.processes)).toStrictEqual({...item, id: itemId})
  })

  test('can update item', () => {
    const sut: StorageService = new StorageService(newConfiguration.ClientConfiguration)
    const processes = sut.getItemsByType(contextTypes.processes)
    const item = processes.pop()

    expect(item.content).not.toBe({})
    sut.update({...item, content: {}})

    expect(sut.getItemsByType(contextTypes.processes).length).toBe(1)
    expect(sut.get(item.id, item.contextType).content).toStrictEqual({})
  })

  test('can delete item', () => {
    const sut: StorageService = new StorageService(newConfiguration.ClientConfiguration)
    const processes = sut.getItemsByType(contextTypes.processes)
    const [item] = processes
    expect(sut.getItemsByType(contextTypes.processes).length).toBe(1)
    const itemId = sut.delete(item.id, item.contextType)
    expect(itemId).toBeTruthy()
    expect(sut.getItemsByType(contextTypes.processes).length).toBe(0)
  })
})

