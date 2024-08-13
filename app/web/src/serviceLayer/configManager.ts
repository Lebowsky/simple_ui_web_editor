import { Repository } from "../adapters/repository/abstractRepository";
import { ProcessesRepository } from "../adapters/repository/processesRepository";
import { IConfigStorage } from "../adapters/storageService";

export class ConfigManager {
  public processes: ProcessesRepository

  constructor(storage: IConfigStorage){
    this.processes = new ProcessesRepository(storage)
  }
}