import SideMenu from "./sideMenu/SideMenu"
import Content from "./content/Content"
import { ConfigurationContextProvider } from "../context/ConfigurationContext"

const App = () => {
  return (

    <div>
      <SideMenu />
      <ConfigurationContextProvider>
        <div className="content-wrapper">
          <Content />
        </div>

        <div id="modals-wrap"></div>
        <div className="hidden-conf-json"></div>
        <footer></footer>
      </ConfigurationContextProvider>
    </div>
  )
}

export default App