import { IConfigItemCreate } from "../models/configurationModels";
import { contextTypes } from "../models/globalContext";

export class ConfigModelsFactory {
  public createNew(type: contextTypes, parentId: number=0): IConfigItemCreate {
    switch (type) {
      case contextTypes.processes:
        return {
          contextType: type,
          parentId: parentId,
          content: {
            type: 'Process',
            ProcessName: 'New process',
            DefineOnBackPressed: false,
            hidden: false,
            login_screen: false,
            Operations: []
          }

        }
    }
  }
}