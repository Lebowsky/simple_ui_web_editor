import { useState } from 'react'
import { IConfigurationContext, useConfigurationContext } from '../../context/ConfigurationContext'
import { IMainContextProvider, useMainContext } from '../../context/MainContext'
import { contextTypes, DataItem } from '../../models/globalContext'
import { ConfigModelsFactory } from '../../utils/configModelsFactory'
import { InputParam } from '../core/InputParam'
import { ListItemProcess } from '../core/ListItemProcess'
import { ParamsRow } from '../core/ParamsRow'
import TextField from '../core/TextField'
import { IConfigItem } from '../../models/configurationModels'
import { TextArea } from '@blueprintjs/core'

export const TabsContent = () => {
  const { globalContext } = useConfigurationContext() as IConfigurationContext
  const { activeTab } = useMainContext() as IMainContextProvider

  const commonData = globalContext?.common.all()?.[0]
  return (
    <>
      {activeTab === contextTypes.common && commonData && <CommonSection content={commonData.content}/>}
      {activeTab === contextTypes.processes && <ProcessesSection />}
      {activeTab === contextTypes.mainMenu && <MainMenuSection />}
      {activeTab === contextTypes.configurationSettings && <PropertiesSection />}
      {activeTab === contextTypes.shedulers && <SchedulersSection />}
      {activeTab === contextTypes.pyFiles && <PythonFilesSection />}
      {activeTab === contextTypes.mediafiles && <MediaFilesSection />}
      {activeTab === contextTypes.commonHandlers && <CommonHandlersSection />}
    </>
  )
}

interface ICommonSectionProps {
  content: DataItem
}
const CommonSection = (props: ICommonSectionProps) => {
  if (!props.content) return 
  const [content, setContent] = useState<DataItem>(props.content)  
  const fields = {
    ConfigurationName: {
      value: content.ConfigurationName,
      name: 'ConfigurationName',
      text: 'Configuration name',
      description: 'Configuration name'
    },
    ConfigurationVersion: {
      value: content.ConfigurationVersion,
      name: 'ConfigurationVersion',
      text: 'Version',
      description: 'Version'
    },
    ConfigurationDescription: {
      value: content.ConfigurationDescription,
      name: 'ConfigurationDescription',
      text: 'Description',
      description: 'Description'
    },
  }
  const onChange = (key: string, value: any) => {
    setContent(prev => ({ ...prev, ...{ [key]: value } }))
  }

  return (
    <section id='main-conf-common' className='active'>
      <div className='section-header'>Common<i className='fa fa-angle-up' aria-hidden='true'></i></div>
      <div className='list-wrap show'>
        <ul className='list form configuration'>
        <TextField {...fields.ConfigurationName} onChange={(value) => onChange('ConfigurationName', value)} />
        <TextField {...fields.ConfigurationVersion} onChange={(value) => onChange('ConfigurationVersion', value)} />
        <ParamsRow>
        <div className='textarea-param-wrapper'>
          <TextArea rows={10} className='textarea-param' value={fields.ConfigurationDescription.value}></TextArea>
        </div>
        </ParamsRow>
        </ul>
      </div>
    </section>
  )
}

const ProcessesSection = () => {
  const { globalContext } = useConfigurationContext() as IConfigurationContext
  const processes = globalContext?.processes.all() || []

  const btnAddClick = () => {
    const factory = new ConfigModelsFactory()
    const newElement = factory.createNew(contextTypes.processes)

    // const modal = new ElementModal(element);
    // modal.render().addClass('edited').addClass('new-element').show();
  }

  return (
    <section id='main-conf-process-new' className='active'>
      <div className='section-header'>Processes<i className='fa fa-angle-up' aria-hidden='true'></i></div>
      <div className='list-wrap show'>
        <ul className='list ui-sortable'  data-id='1'>
          <div className='btn-group'>
            <button>Add</button>
            <button className='btn-paste' data-childrens-type='Processes'>Paste</button>
            <button className='btn-add cv process'>Add CVOperation</button>
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
    <section id='main-conf-main-menu' className='active'>
      <div className='section-header'>Main menu<i className='fa fa-angle-up' aria-hidden='true'></i></div>
      <div className='list-wrap show'>
        <ul className='list' id='main-menu'>No Items</ul>
      </div>
    </section>
  )
}

const PropertiesSection = () => {
  const { globalContext } = useConfigurationContext() as IConfigurationContext
  const tabData = globalContext?.settings.all()?.[0]
  return (
    <section id='main-conf-properties' className='active'>
      <div className='section-header'>Properties<i className='fa fa-angle-up' aria-hidden='true'></i></div>
      <div className='list-wrap show'>
        <ul className='list form configuration'>
          <ParamsRow>
            <InputParam paramName='vendor' label='Vendor' configData={tabData} ></InputParam>
            <InputParam paramName='vendor_url' label='Vendor URL' configData={tabData} ></InputParam>
          </ ParamsRow>
          <ParamsRow>
            <InputParam paramName='vendor_login' label='Vendor login (Basic)' configData={tabData}></InputParam>
            <InputParam paramName='vendor_password' label='Vendor password (Basic)' configData={tabData}></InputParam>
          </ ParamsRow>
          <ParamsRow>
            <InputParam paramName='vendor_auth' label='Vendor raw authorization string' configData={tabData}></InputParam>
          </ ParamsRow>
        </ul>
      </div>
    </section>
  )
}

const SchedulersSection = () => {
  return (
    <section id='main-conf-schedulers' className='active'>
      <div className='section-header'>Shedulers<i className='fa fa-angle-up' aria-hidden='true'></i></div>
      <div className='list-wrap show'>
        <ul className='list' id='shedulers'>No Items</ul>
      </div>
    </section>
  )
}

const PythonFilesSection = () => {
  return (
    <section id='main-conf-python-files' className='active'>
      <div className='section-header'>Python files<i className='fa fa-angle-up' aria-hidden='true'></i></div>
      <div className='list-wrap show'>
        <ul className='list'>
          <li>
            <button id='open-py-handlers-file'>Open file</button>
            <label>Handlers file (Python)</label>
            <span className='param'></span >
            <span id='py-handlers-file-path' data-param-name='pyHandlersPath'>&lt;Not selected&gt;</span>
          </li>
        </ul>
        <ul className='list' id='py-files'>No Items</ul>
      </div>
    </section>
  )
}

const MediaFilesSection = () => {
  return (
    <section id='main-conf-media-files' className='active'>
      <div className='section-header'>Media files<i className='fa fa-angle-up' aria-hidden='true'></i>
      </div>
      <div className='list-wrap show'>
        <ul className='list' id='media-files'>No Items</ul>
      </div>
    </section>
  )
}

const CommonHandlersSection = () => {
  return (
    <section id='main-conf-common-handlers' className='active'>
      <div className='section-header'>Common handlers<i className='fa fa-angle-up' aria-hidden='true'></i></div>
      <div className='list-wrap show'>
        <ul className='list' id='common-handlers'>No Items</ul>
      </div>
    </section>
  )
}