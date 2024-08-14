import { contextTypes, StorageService } from "../adapters/storageService";
import { newConfiguration } from "../data/newConfig";


describe('testing StorageService', () => {
  test('can create storage with json data and make json', () => {
    const expected = newConfiguration
    const sut: StorageService = new StorageService(newConfiguration)
    const actual = sut.getConfigurationJson()
    expect(actual).toStrictEqual(expected)
  })

  test('can get item by id', () => {
    const sut: StorageService = new StorageService(newConfiguration)
    const processes = sut.getItemsByType(contextTypes.processes)
    const item = processes.pop()

    expect(sut.get(item.id, item.contextType)).toBeTruthy()
    expect(sut.get(-1, item.contextType)).toBeFalsy()
  })

  test('can create new item', () => {
    const sut: StorageService = new StorageService(newConfiguration)
    const item = {
      parentId: 0,
      contextType: contextTypes.processes,
      content: {}
    }
    const length =  sut.getItemsByType(contextTypes.processes).length
    
    expect(length).toBeTruthy()
    const itemId = sut.create(item)
    expect(itemId).toBeTruthy()
    expect(sut.getItemsByType(contextTypes.processes).length).toBe(length + 1)
    expect(sut.get(itemId, contextTypes.processes)).toStrictEqual({...item, id: itemId})
  })

  test('can update item', () => {
    const sut: StorageService = new StorageService(newConfiguration)
    const processes = sut.getItemsByType(contextTypes.processes)
    const length = processes.length
    const item = processes.pop()
    
    expect(item.content).not.toBe({})
    sut.update({...item, content: {}})

    expect(sut.getItemsByType(contextTypes.processes).length).toBe(length)
    expect(sut.get(item.id, item.contextType).content).toStrictEqual({})
  })

  test('can delete item', () => {
    const sut: StorageService = new StorageService(newConfiguration)
    const processes = sut.getItemsByType(contextTypes.processes)
    const [item] = processes
    const length = sut.getItemsByType(contextTypes.processes).length

    const itemId = sut.delete(item.id, item.contextType)
    expect(itemId).toBeTruthy()
    expect(sut.getItemsByType(contextTypes.processes).length).toBe(length-1)
  })
})

