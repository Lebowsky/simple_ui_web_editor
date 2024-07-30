import { useState } from 'react';
import './SideMenu.css'

export const SideMenu = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  function toggleMainMenu() {
    setIsOpen(prev => !prev)
  }

  const btnMenuClass = isOpen ? 'toggle-mnu on' : 'toggle-mnu' 
  const btnGroupClass = isOpen ? 'btn-group main active' : 'btn-group main' 

  return (
    <>
      <a href="#menu" className={btnMenuClass} onClick={toggleMainMenu}><span></span></a>
      <div className={btnGroupClass}>
        <SideMenuButton label="New Project" hotkey="(Ctrl+N)" onClick={() => {}}/>
        <SideMenuButton label="Open Project" hotkey="(Ctrl+O)" onClick={() => {}}/>
        <SideMenuButton label="Save Project" hotkey="(Ctrl+S)" onClick={() => {}}/>
        <SideMenuButton label="Save Project as..." hotkey="(Ctrl+Shift+S)" onClick={() => {}}/>
        <SideMenuButton label="Export Data" hotkey="(Ctrl+Shift+E)" onClick={() => {}}/>
        <SideMenuButton label="QR Settings" hotkey="(Ctrl+Alt+Q)" onClick={() => {}}/>
        <SideMenuButton label="Preview" hotkey="(Ctrl+Alt+P)" onClick={() => {}}/>
        <SideMenuButton label="SQL Query" hotkey="(Ctrl+Alt+K)" onClick={() => {}}/>
        <SideMenuButton label="Search" hotkey="(Ctrl+Shift+F)" onClick={() => {}}/>
      </div>
    </>
  )
}

interface ISideMenuButtonProps {
  label: string
  hotkey: string
  onClick(): void
}
const SideMenuButton = (props: ISideMenuButtonProps) => {
  return (
    <>
      <button onClick={props.onClick}>
        {props.label}
        <span>{props.hotkey}</span>
      </button>
    </>
  )
}