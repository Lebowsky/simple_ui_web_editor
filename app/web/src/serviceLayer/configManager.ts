import { Repository } from "../adapters/repository/abstractRepository";
import { ProcessesRepository } from "../adapters/repository/processesRepository";
import { IConfigItem, IConfigStorage } from "../adapters/storageService";

export class ConfigManager {
  private __storage: IConfigStorage
  public processes: ProcessesRepository

  constructor(storage: IConfigStorage){
    this.__storage = storage
    this.processes = new ProcessesRepository(storage)
  }

  public getItemTree(item: IConfigItem){
    const result = this.__storage.getItemTree(item)
    return result
  }
}