import { Header } from "./Header"
import { Tabs } from "./Tabs"
import { TabsContent } from "./TabsContent"

const Content = () => {
  return (
    <>
      <div className="content">
        <Header />
        <span className="file-path"></span>
        <div className="main-conf-wrap">
          <Tabs />
          <TabsContent />
        </div>
      </div>
    </>
  )
}

export default Content