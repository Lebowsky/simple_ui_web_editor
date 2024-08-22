import { IMainContextProvider, useMainContext } from "../../context/MainContext"
import { IConfigItem } from "../../models/configurationModels"
import { ListItemButtons } from "./ListItemButtons"
import { ListItemOperation } from "./ListItemOperation"

interface IListItemProcessProps {
  listItem: IConfigItem
  label: string
  isActive?: boolean
  selectItem: () => void
}

export const ListItemProcess = ({ label, listItem, isActive=false, selectItem }: IListItemProcessProps) => {
  const { setModalVisible, setCurrentModalItem } = useMainContext() as IMainContextProvider

  const onClick = (e: React.MouseEvent<HTMLLIElement>) => {
    e.stopPropagation()
    selectItem()
  }

  const editItem = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation()
    setModalVisible(true)
    setCurrentModalItem(listItem)
  }
  return (
    <li className={`list-item ${isActive && 'active'}`} onClick={(e) => onClick(e)}>
      <div className="item-nav">
        <span className="item-name" onClick={(e) => editItem(e)}>{ label }</span>
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