import { createContext, useContext, useState } from "react";

const ConfigurationContext = createContext({})

interface IConfigurationContextProvider{
  children: React.ReactNode
}
export const ConfigurationContextProvider = ({ children }:IConfigurationContextProvider ) => {
  return (
    <ConfigurationContext.Provider
      value = {{}}
    >
      { children }
    </ConfigurationContext.Provider>
  )
}
