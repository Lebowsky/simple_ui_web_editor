import { IConfigurationContext, useConfigurationContext } from '../../context/ConfigurationContext'
import { IMainContextProvider, useMainContext } from '../../context/MainContext'
import { contextTypes, DataItem } from '../../models/globalContext'
import { CommonSection } from './tabsContent/Common'
import { ProcessesSection } from './tabsContent/Processes'
import { MainMenuSection } from './tabsContent/MainMenu'
import { PropertiesSection } from './tabsContent/Properties'
import { SchedulersSection } from './tabsContent/Shedulers'
import { PythonFilesSection } from './tabsContent/PythonFiles'
import { MediaFilesSection } from './tabsContent/MediaFiles'
import { CommonHandlersSection } from './tabsContent/CommonHandlers'

export const TabsContent = () => {
  const { globalContext } = useConfigurationContext() as IConfigurationContext
  const { activeTab } = useMainContext() as IMainContextProvider

  const commonData = globalContext?.common.all()?.[0]
  const propertiesData = globalContext?.settings.all()?.[0]
  
  return (
    <>
      {activeTab === contextTypes.common && commonData && <CommonSection content={commonData.content} />}
      {activeTab === contextTypes.processes && <ProcessesSection />}
      {activeTab === contextTypes.mainMenu && <MainMenuSection />}
      {activeTab === contextTypes.configurationSettings && <PropertiesSection content={propertiesData.content} />}
      {activeTab === contextTypes.shedulers && <SchedulersSection />}
      {activeTab === contextTypes.pyFiles && <PythonFilesSection />}
      {activeTab === contextTypes.mediafiles && <MediaFilesSection />}
      {activeTab === contextTypes.commonHandlers && <CommonHandlersSection />}
    </>
  )
}

