import { ICommon, IConfigItem } from "../../models/configurationModels"
import { contextTypes } from "../../models/globalContext"
import { IConfigStorage } from "../storageService"
import { Repository } from "./abstractRepository"



interface CommonItem extends Omit<IConfigItem, 'content'> {
  content: ICommon
}

export class CommonElementsRepository extends Repository{
  constructor (storage: IConfigStorage){
    super(storage)
    this.__contextType = contextTypes.common
  }

  add(item: CommonItem){
    return super.add(item)
  }

  get(id: number){
    return super.get(id)
  }

  delete(id: number){
    return super.delete(id)
  }

  all(): CommonItem[] {
    const result = super.all()

    return result.map(el => ({
        ...el, 
        content: {
          ConfigurationName: el.content.ConfigurationName,
          ConfigurationVersion: el.content.ConfigurationVersion,
          ConfigurationDescription: el.content.ConfigurationDescription,
          ...el.content
        }
      })
    )
  }
}