import { createContext, useContext, useState } from "react";
import { contextTypes } from "../models/globalContext";
import { IConfigItem } from "../models/configurationModels";

export interface IMainContextProvider{
  sideMenuVisible: boolean
  setSideMenuVisible: React.Dispatch<React.SetStateAction<boolean>>
  modalVisible: boolean
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>
  activeTab: contextTypes
  setActiveTab: React.Dispatch<React.SetStateAction<contextTypes>>
  currentModalItem: IConfigItem
  setCurrentModalItem: React.Dispatch<React.SetStateAction<IConfigItem>>
  closeModal: () => void
}

const MainContext = createContext<IMainContextProvider | null>(null)

interface IMainContextProviderProps {
  children: React.ReactNode
}
export const MainContextProvider = ({ children }: IMainContextProviderProps) => {
  const [sideMenuVisible, setSideMenuVisible] = useState<boolean>(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [activeTab, setActiveTab] = useState(contextTypes.common)
  const [currentModalItem, setCurrentModalItem] = useState<IConfigItem | null>(null)
  const [modals, setModals] = useState<IConfigItem[]>([])

  const closeModal = () => {
    setCurrentModalItem(null)
    setModalVisible(Boolean(modals.length))
  }
  return (
    <MainContext.Provider
      value={{
        sideMenuVisible,
        setSideMenuVisible,
        modalVisible,
        setModalVisible,
        activeTab,
        setActiveTab,
        currentModalItem,
        setCurrentModalItem,
        closeModal
      }}
    >
      {children}
    </MainContext.Provider>
  )
}

export function useMainContext() {
  return useContext(MainContext)
}