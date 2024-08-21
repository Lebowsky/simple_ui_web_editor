import { createContext, useContext, useState } from "react";
import { contextTypes } from "../models/globalContext";

export interface IMainContextProvider{
  sideMenuVisible: boolean
  setSideMenuVisible: React.Dispatch<React.SetStateAction<boolean>>
  modalVisible: boolean
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>
  activeTab: contextTypes
  setActiveTab: React.Dispatch<React.SetStateAction<contextTypes>>
}

const MainContext = createContext<IMainContextProvider | null>(null)

interface IMainContextProviderProps {
  children: React.ReactNode
}
export const MainContextProvider = ({ children }: IMainContextProviderProps) => {
  const [sideMenuVisible, setSideMenuVisible] = useState<boolean>(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [activeTab, setActiveTab] = useState(contextTypes.common)

  return (
    <MainContext.Provider
      value={{
        sideMenuVisible,
        setSideMenuVisible,
        modalVisible,
        setModalVisible,
        activeTab,
        setActiveTab
      }}
    >
      {children}
    </MainContext.Provider>
  )
}

export function useMainContext() {
  return useContext(MainContext)
}