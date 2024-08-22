import { useConfigurationContext, IConfigurationContext } from '../../../context/ConfigurationContext';
import useTabsContent from '../../../hooks/tabsContent';
import { IConfigurationSettingsContent } from '../../../models/configurationModels';
import { InputParam } from '../../core/InputParam';
import { ParamsRow } from '../../core/ParamsRow';
import TextField from '../../core/TextField';

interface IPropertiesSectionProps {
  content: IConfigurationSettingsContent
}

export const PropertiesSection = (props: IPropertiesSectionProps) => {
  if (!props.content) return
  const { content, onChangeContent } = useTabsContent(props.content)
  const tabContent: IConfigurationSettingsContent = content as IConfigurationSettingsContent

  const fields = {
    vendor: {
      value: tabContent.vendor,
      name: 'vendor',
      text: 'Vendor',
      description: 'Vendor name'
    },
    vendor_url: {
      value: tabContent.vendor_url,
      name: 'vendor_url',
      text: 'Vendor URL',
      description: 'Vendor URL'
    },
    vendor_login: {
      value: tabContent.vendor_login,
      name: 'vendor_login',
      text: 'Vendor login',
      description: 'Vendor login'
    },
    vendor_password: {
      value: tabContent.vendor_password,
      name: 'vendor_password',
      text: 'Vendor password',
      description: 'Vendor password'
    },
  }


  // const { globalContext } = useConfigurationContext() as IConfigurationContext
  // const tabData = globalContext?.settings.all()?.[0]
  return (
    <section id='main-conf-properties' className='active'>
      <div className='section-header'>Properties<i className='fa fa-angle-up' aria-hidden='true'></i></div>
      <div className='list-wrap show'>
        <ul className='list form configuration'>
          <div style={{ paddingLeft: 20 }}>
            <h2>Vendor</h2>
            <div style={{ display: 'flex' }}>
              <TextField {...fields.vendor} onChange={(value) => onChangeContent('vendor', value)} />
              <TextField {...fields.vendor_url} onChange={(value) => onChangeContent('vendor_url', value)} />
            </div>
            <div style={{ display: 'flex' }}>
              <TextField {...fields.vendor_login} onChange={(value) => onChangeContent('vendor_login', value)} />
              <TextField {...fields.vendor_password} onChange={(value) => onChangeContent('vendor_password', value)} />
            </div>
          </div>
          {/* <ParamsRow>
            <InputParam paramName='vendor' label='Vendor' configData={tabData}></InputParam>
            <InputParam paramName='vendor_url' label='Vendor URL' configData={tabData}></InputParam>
          </ParamsRow>
          <ParamsRow>
            <InputParam paramName='vendor_login' label='Vendor login (Basic)' configData={tabData}></InputParam>
            <InputParam paramName='vendor_password' label='Vendor password (Basic)' configData={tabData}></InputParam>
          </ParamsRow>
          <ParamsRow>
            <InputParam paramName='vendor_auth' label='Vendor raw authorization string' configData={tabData}></InputParam>
          </ParamsRow> */}
        </ul>
      </div>
    </section>
  )
}
