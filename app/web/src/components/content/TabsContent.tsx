import { IConfigurationContext, useConfigurationContext } from "../../context/ConfigurationContext"
import { InputParam } from "../core/InputParam"
import { ListItemProcess } from "../core/ListItemProcess"
import { ParamsRow } from "../core/ParamsRow"

export const TabsContent = () => {
  return (
    <>
      <CommonSection />
      <ProcessesSection />
      <ProcessesSectionNew />
      <MainMenuSection />
      <PropertiesSection />
      <SchedulersSection />
      <PythonFilesSection />
      <MediaFilesSection />
      <CommonHandlersSection />
    </>
  )
}

const CommonSection = () => {
  return (
    <section id="main-conf-common" className="active">
      <div className="section-header">Common<i className="fa fa-angle-up" aria-hidden="true"></i></div>
      <div className="list-wrap show">
        <ul className="list form configuration">
          <ParamsRow>
            <InputParam paramName="ConfigurationName" label='Configuration name'></InputParam>
            <InputParam paramName="ConfigurationVersion" label='Version'></InputParam>
          </ParamsRow>
          <ParamsRow>
            <div className="textarea-param-wrapper">
              <label htmlFor="ConfigurationDescription">Description</label>
              <textarea className="textarea-param" id="ConfigurationDescription" name="ConfigurationDescription" data-param-name="ConfigurationDescription" rows={10}>
              </textarea>
            </div>
          </ParamsRow>
        </ul>
      </div>
    </section>
  )
}

const ProcessesSection = () => {
  return (
    <section id="main-conf-process">
      <div className="section-header">Processes<i className="fa fa-angle-up" aria-hidden="true"></i></div>
      <div className="list-wrap show">
        <ul className="list" id="processes">No process</ul>
      </div>
    </section>
  )
}

const ProcessesSectionNew = () => {
  const { globalContext } = useConfigurationContext() as IConfigurationContext
  const processes = globalContext?.processes.all() || []

  return (
    <section id="main-conf-process-new">
      <div className="section-header">Processes<i className="fa fa-angle-up" aria-hidden="true"></i></div>
      <div className="list-wrap show">
        <ul className="list ui-sortable" id="processes" data-id="1">
          <div className="btn-group">
            <button className="btn-add process">Add</button>
            <button className="btn-paste" data-childrens-type="Processes">Paste</button>
            <button className="btn-add cv process">Add CVOperation</button>
          </div>
          {
            processes.length 
            ? processes.map(el => (<ListItemProcess label={el.content.ProcessName} key={el.id} listItem={el}/>))
            : <div style={{paddingTop: 15}}><span >No Items</span></div>
          }
        </ul>
      </div>
    </section>
  )
}

const MainMenuSection = () => {
  return (
    <section id="main-conf-main-menu">
      <div className="section-header">Main menu<i className="fa fa-angle-up" aria-hidden="true"></i></div>
      <div className="list-wrap show">
        <ul className="list" id="main-menu">No Items</ul>
      </div>
    </section>
  )
}

const PropertiesSection = () => {
  return (
    <section id="main-conf-properties">
      <div className="section-header">Properties<i className="fa fa-angle-up" aria-hidden="true"></i></div>
      <div className="list-wrap show">
        <ul className="list form configuration">
          <ParamsRow>
            <InputParam paramName="vendor" label='Vendor'></InputParam>
            <InputParam paramName="vendor_url" label='Vendor URL'></InputParam>
          </ ParamsRow>
          <ParamsRow>
            <InputParam paramName="vendor-login" label='Vendor login (Basic)'></InputParam>
            <InputParam paramName="vendor-password" label='Vendor password (Basic)'></InputParam>
          </ ParamsRow>
          <ParamsRow>
            <InputParam paramName="vendor_auth" label='Vendor raw authorization string'></InputParam>
          </ ParamsRow>
        </ul>
      </div>
    </section>
  )
}

const SchedulersSection = () => {
  return (
    <section id="main-conf-schedulers">
      <div className="section-header">Shedulers<i className="fa fa-angle-up" aria-hidden="true"></i></div>
      <div className="list-wrap show">
        <ul className="list" id="shedulers">No Items</ul>
      </div>
    </section>
  )
}

const PythonFilesSection = () => {
  return (
    <section id="main-conf-python-files">
      <div className="section-header">Python files<i className="fa fa-angle-up" aria-hidden="true"></i></div>
      <div className="list-wrap show">
        <ul className="list">
          <li>
            <button id="open-py-handlers-file">Open file</button>
            <label>Handlers file (Python)</label>
            <span className="param"></span >
            <span id="py-handlers-file-path" data-param-name="pyHandlersPath">&lt;Not selected&gt;</span>
          </li>
        </ul>
        <ul className="list" id="py-files">No Items</ul>
      </div>
    </section>
  )
}

const MediaFilesSection = () => {
  return (
    <section id="main-conf-media-files">
      <div className="section-header">Media files<i className="fa fa-angle-up" aria-hidden="true"></i>
      </div>
      <div className="list-wrap show">
        <ul className="list" id="media-files">No Items</ul>
      </div>
    </section>
  )
}

const CommonHandlersSection = () => {
  return (
    <section id="main-conf-common-handlers">
      <div className="section-header">Common handlers<i className="fa fa-angle-up" aria-hidden="true"></i></div>
      <div className="list-wrap show">
        <ul className="list" id="common-handlers">No Items</ul>
      </div>
    </section>
  )
}