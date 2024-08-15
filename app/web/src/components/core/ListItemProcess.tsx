import { IConfigItem } from "../../adapters/storageService"
import { ListItemButtons } from "./ListItemButtons"
import { ListItemOperation } from "./ListItemOperation"

interface IListItemProcessProps {
  listItem: IConfigItem
  label: string
}

export const ListItemProcess = ({ label, listItem }: IListItemProcessProps) => {
  return (
    <li className="list-item" data-id="2" data-type="Processes">
      <div className="item-nav">
        <span className="item-name">{ label }</span>
        <ListItemButtons listItem={listItem} />
      </div>
      <div className="item-childs list ui-sortable" id="operations" data-id="2" style={{ display: 'none' }}>
        <div className="btn-group">
          <button className="btn-add">Add</button>
          <button className="btn-paste" data-childrens-type="Operations">Paste</button>
        </div>
        {/* <ListItemOperation /> */}
      </div>
    </li>
  )
} 