import { IConfigItem, IConfigItemCreate, IConfigItemUpdate } from "../models/configurationModels"
import { contextTypes } from "../models/globalContext"

export interface IConfigStorage {
  get(id: number): IConfigItem | null
  create(item: IConfigItemCreate): number
  update(item: IConfigItem): number
  delete(id: number): number | null
  getItemsByParentId(parentId: number): IConfigItem[]
  getItemsByType(type: contextTypes): IConfigItem[]
}

export class StorageService implements IConfigStorage{
  private __id: number
  private __elements: IConfigItem[] = []
  
  constructor() {
    this.__id = 0
  }
  public get(id: number): IConfigItem | null {
    const result = this.__elements.find(item => item.id == id)
    return structuredClone(result) || null
  }
  public create(newItem: IConfigItemCreate): number {
    const itemId = this.__getId()
    this.__elements.push({ ...newItem, id: itemId })
    return itemId
  }
  public update(item: IConfigItemUpdate): number {
    const storageItem = this.get(item.id)
    const index = this.__elements.indexOf(storageItem)
    this.__elements[index] = { ...storageItem, ...{ content: item.content } }
    return storageItem.id
  }
  public delete(id: number): number | null {
    const storageItem = this.get(id)
    if (!storageItem) return null

    this.__elements.splice(this.__elements.indexOf(storageItem), 1)
    return storageItem.id
  }
  public getItemsByType(type: contextTypes): IConfigItem[] {
    return structuredClone(this.__elements.filter(el => el.contextType === type))
  }
  public getItemsByParentId(parentId: number): IConfigItem[] {
    return this.__elements.filter(el => el.parentId = parentId)
  }
  private __getId(): number {
    return ++this.__id
  }
}