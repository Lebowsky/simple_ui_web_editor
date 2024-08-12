import {
  pickNewFileProject,
  showPickFileModal,
  fileLocationSave,
  fileLocationSaveAs,
  exportConfigData,
  showQRSettings,
  // togglePrev,
  showSqlQueries,
  showSearchElements
} from "../../dialogs"

const SideMenu = () => {
  return (
    <>
      <a href="#menu" className="toggle-mnu"><span></span></a>
      <div className="btn-group main">
        <button onClick={ pickNewFileProject }>New Project<span>(Ctrl+N)</span></button>
        <button onClick={ showPickFileModal }>Open Project<span>(Ctrl+O)</span></button>
        <button onClick={ fileLocationSave }>Save Project<span>(Ctrl+S)</span></button>
        <button onClick={ fileLocationSaveAs }>Save Project as...<span>(Ctrl+Shift+S)</span></button>
        <button onClick={ exportConfigData }>Export Data<span>(Ctrl+Shift+E)</span></button>
        <button onClick={ showQRSettings }>QR Settings<span>(Ctrl+Alt+Q)</span></button>
        <button >Preview<span>(Ctrl+Alt+P)</span></button>
        <button onClick={ showSqlQueries }>SQL Query<span>(Ctrl+Alt+K)</span></button>
        <button onClick={ showSearchElements }>Search Elements<span>(Ctrl+Shift+F)</span></button>
      </div>
    </>
  )
}

export default SideMenu