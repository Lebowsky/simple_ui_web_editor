import { IMainContextProvider, useMainContext } from "../../context/MainContext";
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
  const { sideMenuVisible, setSideMenuVisible } = useMainContext() as IMainContextProvider
  type TypeHandler = () => void

  const toggleMenuClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setSideMenuVisible((prev) => !prev)
  }
  const buttonClick = (e: React.MouseEvent<HTMLElement>, handler: TypeHandler) => {
    e.stopPropagation()
    setSideMenuVisible(false)
    handler()
  }
  return (
    <>
      <a href="#menu" className={`${sideMenuVisible ? "toggle-mnu on": "toggle-mnu"}`} onClick={toggleMenuClick}><span></span></a>
      <div className={`${sideMenuVisible ? "btn-group main active" : "btn-group main"}`}>
        <button onClick={(e) => buttonClick(e, pickNewFileProject)}>New Project<span>(Ctrl+N)</span></button>
        <button onClick={(e) => buttonClick(e, showPickFileModal)}>Open Project<span>(Ctrl+O)</span></button>
        <button onClick={(e) => buttonClick(e, fileLocationSave)}>Save Project<span>(Ctrl+S)</span></button>
        <button onClick={(e) => buttonClick(e, fileLocationSaveAs)}>Save Project as...<span>(Ctrl+Shift+S)</span></button>
        <button onClick={(e) => buttonClick(e, exportConfigData)}>Export Data<span>(Ctrl+Shift+E)</span></button>
        <button onClick={(e) => buttonClick(e, showQRSettings)}>QR Settings<span>(Ctrl+Alt+Q)</span></button>
        <button >Preview<span>(Ctrl+Alt+P)</span></button>
        <button onClick={(e) => buttonClick(e, showSqlQueries)}>SQL Query<span>(Ctrl+Alt+K)</span></button>
        <button onClick={(e) => buttonClick(e, showSearchElements)}>Search Elements<span>(Ctrl+Shift+F)</span></button>
      </div>
    </>
  )
}

export default SideMenu