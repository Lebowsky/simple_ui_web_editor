import SideMenu from "./sideMenu/SideMenu"
import Content from "./content/Content"
import { useMainContext, IMainContextProvider } from "../context/MainContext"
import { ConfigurationContextProvider } from "../context/ConfigurationContext"
import { ModalsWrapper } from "./modals/ModalsWrapper"

const App = () => {
  const { setSideMenuVisible } = useMainContext() as IMainContextProvider
  const onClick = () => {
    setSideMenuVisible(false)
  }
  return (
    <div onClick={onClick} style={{ height: '100vh' }}>
      <SideMenu />
      <ConfigurationContextProvider>
        <div className="content-wrapper">
          <Content />
        </div>
        <ModalsWrapper></ModalsWrapper>
        <div className="hidden-conf-json"></div>
        <footer></footer>
      </ConfigurationContextProvider>
    </div>
  )
}

export default App