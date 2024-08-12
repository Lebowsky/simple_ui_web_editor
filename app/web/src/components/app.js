import SideMenu from "./sideMenu/sideMenu"
import Content from "./content/content"

const App = () => {
  return (
    `
      <div>
        ${SideMenu()}
        <div class="content-wrapper">
          ${Content()}
        </div>
        <div id="modals-wrap"></div>
        <div class="hidden-conf-json"></div>
        <footer></footer>
      </div>
    `
  )
}

export default App