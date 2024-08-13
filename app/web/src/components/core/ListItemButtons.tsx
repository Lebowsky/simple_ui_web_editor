export const ListItemButtons = () => {
  return (
    <div className="item-btn">
      <span className="json" title="json"><i className="fa-solid fa-code" aria-hidden="true"></i></span>
      <span className="copy" title="copy"><i className="fa fa-clipboard" aria-hidden="true"></i></span>
      <span className="duplicate" title="duplicate"><i className="fa fa-copy" aria-hidden="true"></i></span>
      <span className="edit" title="edit"><i className="fa fa-edit" aria-hidden="true"></i></span>
      <span className="delete" title="delete"><i className="fa fa-trash" aria-hidden="true"></i></span>
      <span className="move ui-sortable-handle"><i className="fa fa-bars" aria-hidden="true"></i></span>
    </div>
  )
}