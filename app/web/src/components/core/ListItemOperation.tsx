import { ListItemButtons } from "./listItemButtons"

export const ListItemOperation = () => {
  
  return (
    <li className="list-item" data-id="3" data-type="Operations">
      <div className="item-nav">
        <span className="item-name">Новый экран</span>
        <ListItemButtons />
      </div>
      <div className="item-childs list ui-sortable"></div>
    </li>
  )
}
