interface IUiElementConfig {
  node: string
  parentType: string
  path: string
  rowKeys: string[]
  type: string
}
interface IConfigGraphElements {
  id: number
  parentId: number
  parentType: string
  title?: string
  elementConfig: {[key: string]: any}
  elementValues: {[key: string]: any}
  parentConfig: IUiElementConfig
}
export interface IGlobalContext {
  conf: { [key: string]: any }
  configGraph: { elements: IConfigGraphElements[] }
  elementParams: {[key: string]: any}
}

export enum contextTypes {
  root = 'root',
  common = 'common',
  configurationSettings = 'configurationSettings',
  processes = 'processes',
  operations = 'operations',
  handlers = 'handlers',
  elements = 'elements',
  mainMenu = 'mainMenu',
  shedulers = 'shedulers',
  mediafiles = 'mediafiles',
  pyFiles = 'pyFiles',
  commonHandlers = 'commonHandlers',
}

export type DataItem = { [key: string]: any }