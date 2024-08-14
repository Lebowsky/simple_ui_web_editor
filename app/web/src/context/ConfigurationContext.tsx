import { createContext, useContext, useEffect, useState } from "react";
import { ConfigManager } from "../serviceLayer/configManager";

export interface IConfigurationContext {
  globalContext: ConfigManager
}

const ConfigurationContext = createContext<IConfigurationContext | null>(null)
let configManager: ConfigManager

interface IConfigurationContextProviderProps {
  children: React.ReactNode
}
export const ConfigurationContextProvider = ({ children }: IConfigurationContextProviderProps) => {
  const [globalContext, setGlobalContext] = useState<ConfigManager>(null)
  useEffect(() => {
    setGlobalContext(window.configManager)
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
      value={{
        globalContext
      }}
    >
      {children}
    </ConfigurationContext.Provider>
  )
}

export function useConfigurationContext() {
  return useContext(ConfigurationContext)
}