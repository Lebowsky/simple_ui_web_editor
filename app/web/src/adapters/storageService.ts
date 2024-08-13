type DataItem = {[key: string]: any }

export enum contextTypes{
  common='common',
  processes='processes',
  operations='operations',
  handlers='handlers',
  elements='elements',
  mainMenu='mainMenu',
  styleTemplates='styleTemplates',
  startScreen='startScreen',
  shedulers='shedulers',
  commonHandlers='commonHandlers',
  pyFiles='pyFiles',
  mediafiles='mediafiles'
}

export interface IConfigItem {
  id: number
  parentId: number
  contextType: contextTypes
  content: DataItem
}

export interface IConfigItemCreate extends Omit<IConfigItem, 'id'> {}
export interface IConfigItemUpdate extends Omit<IConfigItem, 'parentId,contextType'> {}

export interface IConfigStorage {
  get(id: number, type: contextTypes): IConfigItem | null
  create(item: IConfigItem): number
  update(item: IConfigItem): number
  delete(id: number, type: contextTypes): number | null
}

export class StorageService implements IConfigStorage{
  private __rawData: {[key: string]: any}
  private __id: number
  private __root: {[key: string]: any} = {}
  private __processes: IConfigItem[] = []
  private __operations: IConfigItem[] = []
  private __handlers: IConfigItem[] = []
  private __elements: IConfigItem[] = []
  private __mainMenu: IConfigItem[] = []
  private __common: IConfigItem[] = []

  constructor(rawData: {[key: string]: any}) {
    this.__rawData = rawData
    this.__id = 0
    const {
      Processes,
      PyFiles,
      CommonHandlers,
      Mediafile,
      MainMenu,
      ConfigurationSettings,
      PyTimerTask,
      StyleTemplates,
      ...root
    } = this.__rawData

    this.__parseProcesses(Processes)
    this.__root = root
  }
  public getConfigurationJson(): {[key: string]: any}{
    const confJson = {'ClientConfiguration' : {}}
    confJson.ClientConfiguration = {
        ...this.__rawData,
        ...this.__root,
        Processes: this.__getProcesses(),
      }
    return confJson
  }
  public get(id: number, type: contextTypes): IConfigItem | null {
    const items = this.__getContextItems(type)
    if (!items) return null

    const result = items.find(item => item.id == id)
    return result || null
  }
  public create (newItem: IConfigItemCreate) : number {
    const items = this.__getContextItems(newItem.contextType)
    const itemId = this.__getId()
    items.push({...newItem, id: itemId})
    return itemId
  }
  public update (item: IConfigItemUpdate) : number {
    const storageItem = this.get(item.id, item.contextType)
    const items = this.__getContextItems(item.contextType)
    const index = items.indexOf(storageItem)
    items[index] = {...storageItem, ...{content: item.content}}
    return storageItem.id
  }
  public delete (id: number, type: contextTypes) : number | null {
    const storageItem = this.get(id, type)
    if (!storageItem) return null

    const items = this.__getContextItems(type)
    items.splice(items.indexOf(storageItem), 1)
    return storageItem.id
  }
  public getItemsByType(type: contextTypes): IConfigItem[] {
    return structuredClone(this.__getContextItems(type))
  }
  private __getContextItems(type: contextTypes): IConfigItem[] | null {
    return {
      [contextTypes.processes]: this.__processes,
      [contextTypes.operations]: this.__operations,
      [contextTypes.elements]: this.__elements,
      [contextTypes.handlers]: this.__handlers,
      [contextTypes.mainMenu]: this.__mainMenu,
      [contextTypes.common]: this.__common,
      [contextTypes.styleTemplates]: null,
      [contextTypes.startScreen]: null,
      [contextTypes.shedulers]: null,
      [contextTypes.commonHandlers]: null,
      [contextTypes.pyFiles]: null,
      [contextTypes.mediafiles]: null,
    }[contextTypes[type]] 
  }
  private __getProcesses(): {[key: string]: any}[]{
    return this.__processes.map(item => {
      const nestedKeys: {[key: string]: string} = { Process: 'Operations', CVOperation: 'CVFrames' }
      const nestedItems = { [nestedKeys[item.content.type]]: this.__getOperations(item.id) }
      
      return {
        ...item.content,
        ...nestedItems
      }
    })
  }
  private __getOperations(parentId: number): {[key: string]: any}[]{
    return this.__operations
      .filter(item => item.parentId === parentId)
      .map(item => ({...item.content, Elements: this.__getElements(item.id), Handlers: this.__getHandlers(item.id)}))
  }
  private __getHandlers(parentId: number): {[key: string]: any}[]{
    return this.__handlers
      .filter(item => item.parentId === parentId)
      .map(item => item.content)
  }
  private __getElements(parentId: number): {[key: string]: any}[]{
    return this.__elements
      .filter(item => item.parentId === parentId)
      .map(item => {
        const elements = this.__getElements(item.id)
        const handlers = this.__getHandlers(item.id)

        if (elements.length) return {...item.content, Elements: elements}
        if (handlers.length) return {...item.content, Handlers: handlers}
        else return item.content
      })
  }
  private __parseProcesses(Processes: DataItem[]): void {
    Processes && Processes.forEach(({ Operations, CVFrames, ...item }) => {
      const id = this.__getId()
      this.__processes.push({
        id: id,
        parentId: 0,
        contextType: contextTypes.processes,
        content: item
      })
      Operations && this.__parseOperations(Operations, id)
      CVFrames && this.__parseCVFrames(CVFrames, id)
    });
  }
  private __parseOperations(Operations: DataItem[], parentId: number): void {
    Operations.forEach(({ Elements, Handlers, ...item }) => {
      const id = this.__getId()
      this.__operations.push({
        id: id,
        parentId: parentId,
        contextType: contextTypes.operations,
        content: item
      })
      Elements && this.__parseElements(Elements, id)
      Handlers && this.__parseHandlers(Handlers, id)
    })
  }
  private __parseCVFrames(frames: DataItem[], parentId: number): void {
    frames.forEach(({ Handlers, ...item }) => {
      const id = this.__getId()
      this.__operations.push({
        id: id,
        parentId: parentId,
        contextType: contextTypes.operations,
        content: item
      })
      Handlers && this.__parseHandlers(Handlers, id)
    })
  }
  private __parseElements (elms: DataItem[], parentId: number){
    elms.forEach(({ Elements, ...item }) => {
      const id = this.__getId()
      this.__elements.push({ 
        id: id, 
        parentId: parentId, 
        contextType: contextTypes.elements, 
        content: item 
      })
      Elements && this.__parseElements(Elements, id)
    })
  }
  private __parseHandlers (hls: DataItem[], parentId: number): void {
    hls.forEach(({...item}) => {
      const id = this.__getId()
      this.__handlers.push({ 
        id: id, 
        parentId: 
        parentId, 
        contextType: contextTypes.handlers, 
        content: item 
      })
    })
  }
  private __parseMainMenu (MainMenu: DataItem[]): void {
    MainMenu && MainMenu.forEach(({ ...item }) => {
      const id = this.__getId()
      this.__mainMenu.push({
        id: 0,
        parentId: 0,
        contextType: contextTypes.mainMenu,
        content: item
      })
    });
  }
  private __parseCommon (common: {[key: string]: any}): void{
    this.__common = [{
      id: 0,
      parentId: 0,
      contextType: contextTypes.common,
      content: {
        type: 'common', 
        ConfigurationName: common.ConfigurationName,
        ConfigurationDescription: common.ConfigurationDescription,
        ConfigurationVersion: common.ConfigurationVersion,
        ConfigurationTags: common.ConfigurationTags,
      }
    }]
  }
  private __getId(): number {
    return ++this.__id
  }

}