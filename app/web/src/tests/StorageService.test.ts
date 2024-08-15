import { StorageService } from "../adapters/storageService"
import { contextTypes } from "../models/globalContext"

describe('testing StorageService', () => {
  let sut: StorageService
  beforeEach(() => {
    sut = new StorageService()
  })

  test('test create and get operations', () => {
    const expected = {}
    const item = {
      parentId: 0,
      contextType: contextTypes.root,
      content: expected
    }

    const itemId = sut.create(item)
    expect(itemId).toBeTruthy()
    expect(expected).toMatchObject(sut.get(itemId).content)
  })
  test('test create and update operations', () => {
    const expected = {'data': 123}
    const item = {
      parentId: 0,
      contextType: contextTypes.root,
      content: {}
    }

    const itemId = sut.create(item)
    expect(itemId).toBeTruthy()
    expect({}).toMatchObject(sut.get(sut.create(item)).content)

    sut.update({...item, ...{id: itemId, content: expected}})
    expect(expected).toMatchObject(sut.get(sut.create(item)).content)
  })

  test('test create and delete opeations', () => {
    const item = {
      parentId: 0,
      contextType: contextTypes.root,
      content: {}
    }

    const itemId = sut.create(item)
    expect(sut.get(itemId)).toBeTruthy()

    const result = sut.delete(itemId)
    expect(result).toBeTruthy()
    expect(sut.get(itemId)).toBeFalsy()
  })
})