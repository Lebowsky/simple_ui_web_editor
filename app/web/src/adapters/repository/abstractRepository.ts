import { IConfigItem } from "../../models/configurationModels"
import { contextTypes } from "../../models/globalContext"
import { IConfigStorage } from "../storageService"


export abstract class Repository {
  private __storage: IConfigStorage
  protected __contextType: contextTypes

  constructor(storage: IConfigStorage) {
    this.__storage = storage
  }

  add(item: IConfigItem): number {
    item = this.__storage.get(item.id)
    if (item) return this.__storage.update(item)
    else return this.__storage.create(item)
  }

  get(id: number): IConfigItem | null {
    return this.__storage.get(id)
  }

  delete(id: number): number | null {
    return this.__storage.delete(id)
  }

  all(): IConfigItem[] {
    return this.__storage.getItemsByType(this.__contextType)
  }
}