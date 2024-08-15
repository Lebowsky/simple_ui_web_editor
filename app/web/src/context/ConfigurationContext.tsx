import { createContext, useContext, useEffect, useState } from "react";
import { ConfigManager } from "../serviceLayer/configManager";

export interface IConfigurationContext {
  globalContext: ConfigManager
  notifyUpdate(): void
}

const ConfigurationContext = createContext<IConfigurationContext | null>(null)
let configManager: ConfigManager

interface IConfigurationContextProviderProps {
  children: React.ReactNode
}
export const ConfigurationContextProvider = ({ children }: IConfigurationContextProviderProps) => {
  const [globalContext, setGlobalContext] = useState<ConfigManager>(null)
  const [render, setRender] = useState<boolean> (false)
  useEffect(() => {
    setGlobalContext(window.configManager)
  }, []);

  const notifyUpdate = () => {
    setRender((prev) => !prev)
  }

  return (
    <ConfigurationContext.Provider
      value={{
        globalContext,
        notifyUpdate
      }}
    >
      {children}
    </ConfigurationContext.Provider>
  )
}

export function useConfigurationContext() {
  return useContext(ConfigurationContext)
}