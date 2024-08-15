import { IConfigItem } from "../../models/configurationModels"
import { IConfigurationContext, useConfigurationContext } from "../../context/ConfigurationContext"
import { copyTextToClipboard } from "../../handlers"

interface IListItemButtonsProps {
  listItem: IConfigItem
}

export const ListItemButtons = ({ listItem }: IListItemButtonsProps) => {
  const { globalContext, notifyUpdate } = useConfigurationContext() as IConfigurationContext

  const onClickJson = () => {
    // const elementId = $(this).parents(selectors.listItem).attr('data-id');
    // const elementConf = document.main.configGraph.getConfigElement(elementId);

    // const modal = new JsonModal(elementConf);
    // modal.render();
    // modal.show();
  }
  const onClickCopy = () => {
    // const elementId = $(this).parents(selectors.listItem).attr('data-id');
    // const elementConf = document.main.configGraph.getConfigElement(elementId);
    
    // copyTextToClipboard(JSON.stringify(globalContext.getItemTree(listItem)));
  }
  const onClickDuplicate = () => {
    // let parentType
    // const parentId = $(this).parents('.list').attr('data-id');
    // const elementId = $(this).parents(selectors.listItem).attr('data-id');
    // const elementConf = document.main.configGraph.getConfigElement(elementId);

    // if (elementConf.type == "Process")
    //   parentType = "Processes";
    // else if (elementConf.type == "Operation")
    //   parentType = "Operations";
    // else if (elementConf.type == "CVFrame")
    //   parentType = "CVFrames";
    // else
    //   parentType = "Elements";

    // const newElementId = document.main.configGraph.addElementFromDict(elementConf, parentId, parentType);
    // const element = document.main.configGraph.getElementById(newElementId);
    // const type = element.parentType;
    // let node

    // if (element.parentType == "Operations" || element.parentType == "CVFrames") {
    //   node = $(selectors.processList).find("#operations[data-id='" + parentId + "']")
    // } else {
    //   node = element.parentConfig['node'];
    // }

    // document.main.configGraph.fillListElements(type, node, parentId);
  }
  const onClickEdit = () => {
    // const elementId = $(this).parents(selectors.listItem).attr('data-id');
    // editElement(elementId);
  }
  const onClickDelete = () => {
    if (confirm('Вы уверены?')) {
      globalContext.processes.delete(listItem.id)
      const operations = globalContext.operations.all().filter(item => item.parentId === listItem.id)
      operations.forEach(item => globalContext.operations.delete(item.id))
      notifyUpdate()
    }
  }
  return (
    <div className="item-btn">
      <span title="json"><i className="fa-solid fa-code" aria-hidden="true"></i></span>
      <span title="copy" onClick={onClickCopy}><i className="fa fa-clipboard" aria-hidden="true"></i></span>
      <span title="duplicate"><i className="fa fa-copy" aria-hidden="true"></i></span>
      <span title="edit"><i className="fa fa-edit" aria-hidden="true"></i></span>
      <span title="delete" onClick={onClickDelete}><i className="fa fa-trash" aria-hidden="true"></i></span>
      <span className="move ui-sortable-handle"><i className="fa fa-bars" aria-hidden="true"></i></span>
    </div>
  )
}