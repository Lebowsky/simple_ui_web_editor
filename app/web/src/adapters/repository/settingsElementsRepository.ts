import { IConfigurationSettingsContent, IConfigItem } from "../../models/configurationModels"
import { contextTypes } from "../../models/globalContext"
import { IConfigStorage } from "../storageService"
import { Repository } from "./abstractRepository"



interface SettingsItem extends Omit<IConfigItem, 'content'> {
  content: IConfigurationSettingsContent
}

export class SettingsElementsRepository extends Repository{
  constructor (storage: IConfigStorage){
    super(storage)
    this.__contextType = contextTypes.configurationSettings
  }

  add(item: SettingsItem){
    return super.add(item)
  }

  get(id: number){
    return super.get(id)
  }

  delete(id: number){
    return super.delete(id)
  }

  all(): SettingsItem[] {
    const result = super.all()

    return result.map(el => ({
        ...el, 
        content: {
          vendor: el.content.ConfigurationSettings?.vendor,
          vendor_url: el.content.ConfigurationSettings?.vendor_url,
          vendor_auth: el.content.ConfigurationSettings?.vendor_auth,
          vendor_login: el.content.ConfigurationSettings?.vendor_login,
          vendor_password: el.content.ConfigurationSettings?.vendor_password,
          ...el.content
        }
      })
    )
  }
}