import { createContext, useContext, useEffect, useState } from "react";
import { newConfiguration } from "../data/newConfig";
import { contextTypes, StorageService } from "../adapters/storageService";
import { ConfigManager } from "../serviceLayer/configManager";
import { Main } from "../main";

const ConfigurationContext = createContext({})
let configManager: ConfigManager
interface IConfigurationContextProvider {
  children: React.ReactNode
}
export const ConfigurationContextProvider = ({ children }: IConfigurationContextProvider) => {
  // const [globalContext, setGlobalContext] = useState<IGlobalContext>(null)
  window.main = Object.create(Main);
  

  useEffect(() => {
    const storage = new StorageService(newConfiguration)
    configManager = new ConfigManager(storage)
    // (async () => {
    //   try {
        // const elementParams = await getConfigUIElements();
        // window.main = Object.create(Main)
        // window.main.elementParams = elementParams
        // initHandlers()
        
        // setGlobalContext(prev => {
        //   const {elementParams, conf, configGraph} = window.main
        //   return {...prev, elementParams, conf, configGraph}
        // })
        
      // } catch (err) {
      //   console.log('Something went wrong');
      //   console.log(err)
      // }
    // })();
  }, []); 

  return (
    <ConfigurationContext.Provider
      value={{}}
    >
      {children}
    </ConfigurationContext.Provider>
  )
}

export function useConfigurationContext() {
  return useContext(ConfigurationContext)
}