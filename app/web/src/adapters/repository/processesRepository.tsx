type TContextType = 'process' | 'operation' | 'element'

interface IStorage {
  get(id: number, type: TContextType): IConfigItem
}

type JSONValue =
    | string
    | number
    | boolean
    | { [x: string]: JSONValue }
    | Array<JSONValue>;

interface IConfigItem {
  id: number
  parentId: number
  contextType: TContextType
  content: JSONValue
}

export class ProcessesRepository{
  private __storage: IStorage
  private __contextType: TContextType = 'process'

  constructor (storage: IStorage){
    this.__storage = storage
  }

  add(item: IConfigItem){
    
  }

  get(id: number){
    return this.__storage.get(id, this.__contextType)
  }

  delete(id: number){

  }
}