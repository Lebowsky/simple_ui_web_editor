import { contextTypes, DataItem } from "./globalContext"

export interface ICommon {
  ConfigurationName: string
  ConfigurationVersion: string
  ConfigurationDescription: string
}

interface IConfigurationSettingsContent {
  vendor: string
  vendor_url: string
  vendor_auth: string
  dictionaries: string
}
export interface IConfigurationSettings {
  ConfigurationSettings: IConfigurationSettingsContent | { [key: string]: any }
}

export type IElement = {
  type: string
  Elements: IElement[]
  [key: string]: any 
}

export interface IHandlersItem {
  event: string
  listener: string
  action: string
  type: string
  method: string
  postExecute: string
}

export type IOperation = {
  type: "Operation"
  Name: string
  Timer: boolean
  hideToolBarScreen: boolean
  hideBottomBarScreen: boolean
  noScroll: boolean
  noConfirmation: boolean
  Elements: IElement[]
}

export type IProcess =  {
  type: 'Process'
  ProcessName: string
  DefineOnBackPressed?: boolean
  hidden?: boolean
  login_screen?: boolean
  Operations: IOperation[]
  [key: string]: any 
}

export interface IMainMenuItem {
  MenuId: string
  MenuItem: string 
  MenuTitle: string
  MenuTop: string
}

export interface IMediaFilesItem {
  MediafileKey: string 
  MediafileExt: string
  MediafileData: string
}

export interface IPyFilesItem {
  PyFileKey: string
  PyFileData: string
}

export interface ICommonHandlersItem {
  event: string
  listener: string
  action: string
  type: string
  method: string
  postExecute: string
  alias: string
}
export interface IConfigItem {
  id: number
  parentId: number
  contextType: contextTypes
  content: DataItem
}
export interface IConfigItemCreate extends Omit<IConfigItem, 'id'> { }
export interface IConfigItemUpdate extends Omit<IConfigItem, 'parentId,contextType'> { }


export interface IShedulersItem {
  PyTimerTaskKey: string
  PyTimerTaskDef: string
  PyTimerTaskPeriod: string
  PyTimerTaskBuilIn: string
}
