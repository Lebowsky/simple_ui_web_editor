import { IConfigStorage } from "../adapters/storageService"
import { ICommon, IConfigItem, IConfigItemCreate, IConfigurationSettings } from "../models/configurationModels"
import { contextTypes, DataItem } from "../models/globalContext"

export class ConfigParser {
  private __rootId : number
  private __rawData: { [key: string]: any }
  private __storage: IConfigStorage

  constructor(storage: IConfigStorage){
    this.__storage = storage
  }

  public parseJsonData(rawData: { [key: string]: any }){
    this.__rawData = rawData.ClientConfiguration
    if (!this.__rawData) return

    this.__setRootId()
    
    this.__parseCommon()
    this.__parseSettings()
    this.__parseMainMenu()
    this.__parseMediafiles()
    this.__parsePyFiles()
    this.__parseCommonHandlers()

    this.__parseProcesses()
    this.__parseRoot()
    // expect({}).toStrictEqual(this.__rawData)
    return this.__storage
  }
  public getConfigurationJson(): { [key: string]: any } {
    const confJson = { 'ClientConfiguration': {} }

    confJson.ClientConfiguration = {
      ...this.getItemTreeJson()
    }
    return confJson
  }
  public getItemTreeJson(id: number = 0): { [key: string]: any } {
    const parent = this.__storage.get(id)
    if (!parent) return {}
    const childsCollection = this.__getChildsCollectionName(parent.contextType)

    const itemTree = {
      ...parent.content,
      [childsCollection]: this.__getItemChilds(parent.id)
    }
    return itemTree
  }

  private __getItemChilds(parentId: number): { [key: string]: any }[] {
    const childs = this.__storage.getItemsByParentId(parentId)
    return childs.map(child => {
      const childsCollection = this.__getChildsCollectionName(child.contextType)

      return {
        ...child.content,
        ...{ [childsCollection]: this.__getItemChilds(child.id) }
      }
    })
  }
  private __getChildsCollectionName(type: contextTypes): string | null {
    switch (type) {
      case contextTypes.processes:
        return 'Operations'
      case contextTypes.operations:
        return 'Elements'
      case contextTypes.elements:
        return 'Elements'
      default:
        return null
    }
  }
  private __parseProcesses(): void {
    const processes: [] = this.__popItem('Processes', [])
    processes.forEach(item => {
      const Operations = this.__pop(item, 'Operations', [])
      const CVFrames = this.__pop(item, 'CVFrames', [])
      const id = this.__create({
        parentId: this.__rootId,
        contextType: contextTypes.processes,
        content: item
      })
      this.__parseOperations(Operations, id)
      this.__parseCVFrames(CVFrames, id)
    });
  }
  private __parseOperations(Operations: DataItem[], parentId: number): void {
    Operations.forEach(({ Elements, Handlers, ...item }) => {
      const id = this.__create({
        parentId,
        contextType: contextTypes.operations,
        content: item
      })
      Elements && this.__parseElements(Elements, id)
      Handlers && this.__parseHandlers(Handlers, id)
    })
  }
  private __parseCVFrames(frames: DataItem[], parentId: number): void {
    frames.forEach(({ Handlers, ...item }) => {
      const id = this.__create({
        parentId,
        contextType: contextTypes.operations,
        content: item
      })
      Handlers && this.__parseHandlers(Handlers, id)
    })
  }
  private __parseElements(elms: DataItem[], parentId: number) {
    elms.forEach(({ Elements, ...item }) => {
      const id = this.__create({
        parentId,
        contextType: contextTypes.elements,
        content: item
      })
      Elements && this.__parseElements(Elements, id)
    })
  }
  private __parseHandlers(hls: DataItem[], parentId: number): void {
    hls.forEach(({ ...item }) => {
      this.__create({
        parentId,
        contextType: contextTypes.handlers,
        content: item
      })
    })
  }
  private __parseCommon(): void {
    const content: ICommon = {
      ConfigurationName: this.__popItem('ConfigurationName'),
      ConfigurationDescription: this.__popItem('ConfigurationDescription'),
      ConfigurationVersion: this.__popItem('ConfigurationVersion'),
    }
    this.__create({
      parentId: this.__rootId,
      contextType: contextTypes.common,
      content
    })
  }
  private __parseMainMenu(): void {
    const mainMenu = this.__popItem('MainMenu', [])
    mainMenu.forEach(({ ...item }) => {
      this.__create({
        parentId: this.__rootId,
        contextType: contextTypes.mainMenu,
        content: item
      })
    });
  }
  private __parseSettings(): void {
    const content: IConfigurationSettings = {
      ConfigurationSettings: this.__popItem('ConfigurationSettings', {}),
    }
    this.__create({
      parentId: this.__rootId,
      contextType: contextTypes.configurationSettings,
      content
    })
  }
  private __parseMediafiles(): void {
    const mediafiles = this.__popItem('Mediafile', [])
    mediafiles.forEach(({ ...item }) => {
      this.__create({
        parentId: this.__rootId,
        contextType: contextTypes.mediafiles,
        content: item
      })
    });
  }
  private __parsePyFiles(): void {
  }
  private __parseCommonHandlers(): void {
  }
  private __setRootId() {
    this.__rootId = this.__storage.create({
      parentId: 0,
      contextType: contextTypes.root,
      content: {}
    })
  }
  private __parseRoot(): void {
    const content = Object.fromEntries(Object.keys(this.__rawData).map(key => [key, this.__popItem(key)]))
    this.__storage.update({
      id: this.__rootId,
      parentId: 0,
      contextType: contextTypes.root,
      content
    })
  }
  private __create(item: IConfigItemCreate): number {
    return this.__storage.create(item) 
  }
  private __popItem(key: string, defaultValue: any = '') {
    return this.__pop(this.__rawData, key, defaultValue)
  }
  private __pop(object: { [key: string]: any }, key: string, defaultValue: any = '') {
    if (key in object) {
      let temp = object[key];
      delete object[key];
      return temp;
    }
    return defaultValue
  }
}