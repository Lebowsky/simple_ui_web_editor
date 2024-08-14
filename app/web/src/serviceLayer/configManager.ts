import { Repository } from "../adapters/repository/abstractRepository";
import { OperationsRepository } from "../adapters/repository/operationsRepository";
import { ProcessesRepository } from "../adapters/repository/processesRepository";
import { IConfigItem, IConfigStorage } from "../adapters/storageService";

export class ConfigManager {
  private __storage: IConfigStorage
  public processes: ProcessesRepository
  public operations: OperationsRepository

  constructor(storage: IConfigStorage){
    this.__storage = storage
    this.processes = new ProcessesRepository(storage)
    this.operations = new OperationsRepository(storage)
  }

  public getItemTree(item: IConfigItem){
    const result = this.__storage.getItemTree(item)
    return result
  }
}