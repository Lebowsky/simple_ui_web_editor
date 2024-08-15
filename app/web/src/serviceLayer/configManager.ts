import { Repository } from "../adapters/repository/abstractRepository";
import { OperationsRepository } from "../adapters/repository/operationsRepository";
import { ProcessesRepository } from "../adapters/repository/processesRepository";
import { IConfigStorage } from "../adapters/storageService";
import { ConfigParser } from "../utils/configParser";

export class ConfigManager {
  private __storage: IConfigStorage
  private __configParser: ConfigParser

  public processes: ProcessesRepository
  public operations: OperationsRepository

  constructor(storage: IConfigStorage, ){
    this.__storage = storage
    this.__configParser = new ConfigParser(this.__storage)
    this.processes = new ProcessesRepository(this.__storage)
    this.operations = new OperationsRepository(this.__storage)
  }

  public init(rawData: { [key: string]: any }){
    this.__configParser.parseJsonData(rawData)
  }
  // public getItemTree(item: IConfigItem){
  //   const result = this.__storage.getItemTree(item)
  //   return result
  // }

  // public getItemTreeJson(id: number = 0): { [key: string]: any } {
  //   const parent = this.__elements.find(el => el.id === id)
  //   if (!parent) return {}
  //   const childsCollection = this.__getChildsCollectionName(parent.contextType)

  //   const itemTree = {
  //     ...parent.content,
  //     [childsCollection]: this.__getItemChilds(parent.id)
  //   }
  //   return itemTree
  // }
}