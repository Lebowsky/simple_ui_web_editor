import SideMenu from "./sideMenu/SideMenu"
import Content from "./content/Content"

const App = () => {
  return (
    <div>
      <SideMenu />
      <div className="content-wrapper">
        <Content />
      </div>
      <div id="modals-wrap"></div>
      <div className="hidden-conf-json"></div>
      <footer></footer>
    </div>
  )
}

export default App