const SideMenu = () => {
  return (
    `
      <a href="#menu" class="toggle-mnu"><span></span></a>
      <div class="btn-group main">
        <button id="new-project">New Project<span>(Ctrl+N)</span></button>
        <button id="open-project">Open Project<span>(Ctrl+O)</span></button>
        <button id="save-project">Save Project<span>(Ctrl+S)</span></button>
        <button id="save-project-as">Save Project as...<span>(Ctrl+Shift+S)</span></button>
        <button id="export-data">Export Data<span>(Ctrl+Shift+E)</span></button>
        <button id="qr-settings">QR Settings<span>(Ctrl+Alt+Q)</span></button>
        <button id="preview-button">Preview<span>(Ctrl+Alt+P)</span></button>
        <button id="open-modal-sql-queries">SQL Query<span>(Ctrl+Alt+K)</span></button>
        <button id="open-modal-send-req">Search Elements<span>(Ctrl+Shift+F)</span></button>
      </div>   
    `
  )
}

export default SideMenu