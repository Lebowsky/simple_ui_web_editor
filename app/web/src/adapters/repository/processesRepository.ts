import { contextTypes, IConfigItem, IConfigStorage } from "../storageService"
import { Repository } from "./abstractRepository"

type ProcessData =  {
  type: 'Process', 
  ProcessName: string, 
  DefineOnBackPressed?: boolean,
  hidden?: boolean,
  login_screen?: boolean,
  Operations: any[],
  [key: string]: any 
}

interface ProcessItem extends Omit<IConfigItem, 'content'> {
  content: ProcessData
}

export class ProcessesRepository extends Repository{
  constructor (storage: IConfigStorage){
    super(storage)
    this.__contextType = contextTypes.processes
  }

  add(item: ProcessItem){
    return super.add(item)
  }

  get(id: number){
    return super.get(id)
  }

  delete(id: number){
    return super.delete(id)
  }

  all(): ProcessItem[] {
    const result = super.all()

    return result.map(el => ({
        ...el, 
        content: {
          type: el.content.type, 
          ProcessName: el.content.ProcessName,
          Operations: el.content.Operations,
          ...el.content
        }
      })
    )
  }
}