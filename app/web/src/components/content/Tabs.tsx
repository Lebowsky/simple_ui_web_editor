import React from "react"
import { selectTab } from "../../handlers"
import { IMainContextProvider, useMainContext } from "../../context/MainContext"
import { contextTypes } from "../../models/globalContext"

export const Tabs = () => {
  const { activeTab, setActiveTab } = useMainContext() as IMainContextProvider

  const onClick = (contextType: contextTypes) => {
    setActiveTab(contextType)
  }
  const tabs = {
    [contextTypes.common]: 'Common', 
    [contextTypes.processes]: 'Processes', 
    [contextTypes.mainMenu]: 'MainMenu', 
    [contextTypes.configurationSettings]: 'Properties', 
    [contextTypes.shedulers]: 'Shedulers', 
    [contextTypes.pyFiles]: 'Python files', 
    [contextTypes.mediafiles]: 'Media files', 
    [contextTypes.commonHandlers]: 'Common handlers', 
  }
  return (
    <div className="tabs">
      {Object.entries(tabs).map(([type, label]) => (
        <Tab 
          isActive={activeTab === type}
          label={label}
          onClick={() => onClick(type as contextTypes)}
          key={type}
        />
      ))}
    </div>
  )
}

interface ITabProps{
  isActive: boolean
  label: string
  onClick(): void
}
const Tab = ({isActive, label, onClick}: ITabProps) => {
  const className = isActive ? 'tab active' : 'tab'
  return(
    <div className={className} onClick={onClick}>{label}</div>    
  )
}