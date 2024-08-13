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