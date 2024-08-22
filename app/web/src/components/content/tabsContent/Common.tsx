import { TextArea, Tooltip } from "@blueprintjs/core"
import { ParamsRow } from "../../core/ParamsRow"
import TextField from "../../core/TextField"
import { ICommon } from "../../../models/configurationModels"
import useTabsContent from "../../../hooks/tabsContent"
import { DataItem } from "../../../models/globalContext"

interface ICommonSectionProps {
  content: ICommon
}
export const CommonSection = (props: ICommonSectionProps) => {
  if (!props.content) return

  const { content, onChangeContent } = useTabsContent(props.content)
  const tabContent: ICommon = content as ICommon

  const fields = {
    ConfigurationName: {
      value: tabContent.ConfigurationName,
      name: 'ConfigurationName',
      text: 'Configuration name',
      description: 'Configuration name'
    },
    ConfigurationVersion: {
      value: tabContent.ConfigurationVersion,
      name: 'ConfigurationVersion',
      text: 'Version',
      description: 'Version'
    },
    ConfigurationDescription: {
      value: tabContent.ConfigurationDescription,
      name: 'ConfigurationDescription',
      text: 'Description',
      description: 'Description'
    },
  }

  return (
    <section id='main-conf-common' className='active'>
      <div className='section-header'>Common<i className='fa fa-angle-up' aria-hidden='true'></i></div>
      <div className='list-wrap show'>
        <ul className='list form configuration'>
          <div style={{ display: 'flex' }}>
            <TextField {...fields.ConfigurationName} onChange={(value) => onChangeContent('ConfigurationName', value)} />
            <TextField {...fields.ConfigurationVersion} onChange={(value) => onChangeContent('ConfigurationVersion', value)} />
          </div>
          <ParamsRow>
            <div className='textarea-param-wrapper' >
              <Tooltip content={fields.ConfigurationDescription.description}>
                <TextArea
                  rows={10}
                  className='textarea-param'
                  defaultValue={fields.ConfigurationDescription.value}
                  onChange={(value) => onChangeContent('ConfigurationDescription', value)}
                  placeholder="Enter description here..."
                  fill={true}
                />
              </Tooltip>
            </div>
          </ParamsRow>
        </ul>
      </div>
    </section>
  )
}