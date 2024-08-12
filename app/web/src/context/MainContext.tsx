import { createContext, useContext, useState } from "react";

export interface IMainContextProvider{
  sideMenuVisible: boolean
  setSideMenuVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const MainContext = createContext<IMainContextProvider | null>(null)

interface IMainContextProviderProps {
  children: React.ReactNode
}
export const MainContextProvider = ({ children }: IMainContextProviderProps) => {
  const [sideMenuVisible, setSideMenuVisible] = useState<boolean>(false)

  return (
    <MainContext.Provider
      value={{
        sideMenuVisible,
        setSideMenuVisible
      }}
    >
      {children}
    </MainContext.Provider>
  )
}

export function useMainContext() {
  return useContext(MainContext)
}