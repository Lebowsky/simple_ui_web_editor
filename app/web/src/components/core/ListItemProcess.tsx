import { ListItemButtons } from "./listItemButtons"
import { ListItemOperation } from "./ListItemOperation"

interface IListItemProcess {
  label: string
}

export const ListItemProcess = ({ label }: IListItemProcess) => {
  return (
    <li className="list-item active" data-id="2" data-type="Processes">
      <div className="item-nav">
        <span className="item-name">{ label }</span>
        <ListItemButtons />
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