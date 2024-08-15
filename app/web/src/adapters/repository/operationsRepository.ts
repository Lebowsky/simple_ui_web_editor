import { IConfigItem } from "../../models/configurationModels"
import { contextTypes } from "../../models/globalContext"
import { IConfigStorage } from "../storageService"
import { Repository } from "./abstractRepository"

type OperationData =  {
  type: 'Operation', 
  Name: string, 
  hideToolBarScreen?: boolean,
  hideBottomBarScreen?: boolean,
  noScroll?: boolean,
  noConfirmation?: boolean,
  Elements: any[],
  [key: string]: any 
}

interface OperationItem extends Omit<IConfigItem, 'content'> {
  content: OperationData
}

export class OperationsRepository extends Repository{
  constructor (storage: IConfigStorage){
    super(storage)
    this.__contextType = contextTypes.operations
  }

  add(item: OperationItem){
    return super.add(item)
  }

  get(id: number){
    return super.get(id)
  }

  delete(id: number){
    return super.delete(id)
  }

  all(): OperationItem[] {
    const result = super.all()

    return result.map(el => ({
        ...el, 
        content: {
          type: el.content.type, 
          Name: el.content.ProcessName,
          Elements: el.content.Operations,
          ...el.content
        }
      })
    )
  }
}