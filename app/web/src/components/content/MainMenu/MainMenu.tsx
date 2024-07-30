import './MainMenu.css'

export const MainMenu = () => {
  return (
    <div className="main-conf-wrap">
      <div className="tabs">
        <Tab onClick={() => { }} isActive={false}>Common</Tab>
        <Tab onClick={() => { }} isActive={false}>Processes</Tab>
        <Tab onClick={() => { }} isActive={false}>Main menu</Tab>
        <Tab onClick={() => { }} isActive={false}>Properties</Tab>
        <Tab onClick={() => { }} isActive={false}>Shedulers</Tab>
        <Tab onClick={() => { }} isActive={false}>Python files</Tab>
        <Tab onClick={() => { }} isActive={false}>Media files</Tab>
        <Tab onClick={() => { }} isActive={false}>Common handlers</Tab>
      </div>
      <MenuSectionCommon />
    </div>
  )
}

interface ITabProps {
  children: React.ReactNode
  onClick(): void
  isActive: boolean
}
const Tab = (props: ITabProps) => {
  const className = props.isActive ? 'tab active' : 'tab'
  return (
    <div
      onClick={props.onClick}
      className={className}
    >
      {props.children}
    </div>
  )
}

const MenuSectionCommon = () => {
  return (
    <MenuSectionWrapper title='Common'>
      <ul className="list form configuration">
        <li className="param">
          <div>
            <label htmlFor="ConfigurationName">Configuration-name</label>
            <input type="text" name="ConfigurationName" id="ConfigurationName"
              data-param-name="ConfigurationName" />
          </div>
          <div>
            <label htmlFor="ConfigurationVersion">Version</label>
            <input type="text" name="ConfigurationVersion" id="ConfigurationVersion"
              data-param-name="ConfigurationVersion" />
          </div>
        </li>
        <li className="param">
          <div className="textarea-param-wrapper">
            <label htmlFor="ConfigurationDescription">Description</label>
            <textarea className="textarea-param" id="ConfigurationDescription" name="ConfigurationDescription"
              data-param-name="ConfigurationDescription" rows={10}>
            </textarea>
          </div>
        </li>
      </ul>
    </MenuSectionWrapper>
  )
}

interface IMenuSectionWrapperProps {
  title: string
  children: React.ReactNode
}
const MenuSectionWrapper = (props: IMenuSectionWrapperProps) => {
  return (
    <section>
      <div className="section-header">
        {props.title}
        <i className="fa fa-angle-up" aria-hidden='true'></i>
      </div>
      <div className="list-wrap show">
        {props.children}
      </div>
    </section>
  )
}