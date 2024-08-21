import { IConfigItemCreate, IConfigItemUpdate } from "../../models/configurationModels"

import TextField from "../core/TextField"
import CheckBox from "../core/CheckBox"
import { Button, InputGroup } from "@blueprintjs/core"
import { useState } from "react"
import { DataItem } from "../../models/globalContext"

interface IProcessesItemModalProps {
  title: string
  path: string
  element: IConfigItemCreate | IConfigItemUpdate
}
export const ProcessesItemModal = ({ title, path, element }: IProcessesItemModalProps) => {
  return (
    <div className='modal active' data-modal-type='element'>
      <div className='close-modal'>
        <i className='fa fa-times' aria-hidden='true'></i>
      </div>
      <div className='modal-head'>
        <div className='top'>
          <h2 className='modal-title'>{title}<span className='edited'>*</span></h2>
        </div>
        <span className='path'>{path}</span>
      </div>
      <div className='modal-content'>
        <Params element={element}></Params>
      </div>
    </div>
  )
}

interface ParamsProps {
  element: IConfigItemCreate | IConfigItemUpdate
}
const Params = ({ element }: ParamsProps) => {
  const [modalContent, setModalContent] = useState<DataItem>({ ...element.content })

  const fields = {
    ProcessName: {
      value: modalContent.ProcessName,
      name: 'ProcessName',
      text: 'Process name',
      description: 'Process name'
    },
    DefineOnBackPressed: {
      value: modalContent.DefineOnBackPressed,
      name: 'DefineOnBackPressed',
      text: 'Override back button',
      description: 'Override back button (ON_BACK_PRESSED input event)'
    },
    hidden: {
      value: modalContent.hidden,
      name: 'hidden',
      text: 'Do not display in Menu',
      description: 'Do not display in Menu process'
    },
    login_screen: {
      value: modalContent.login_screen,
      name: 'login_screen',
      text: 'Run at startup',
      description: 'Run at startup process'
    },
  }
  const onChange = (key: string, value: any) => {
    setModalContent(prev => ({ ...prev, ...{ [key]: value } }))
  }

  const saveElementData = () => {
    console.log('clicked')
  }
  return (
    <div className="params" >

      <TextField {...fields.ProcessName} onChange={(value) => onChange('ProcessName', value)} />
      <CheckBox {...fields.DefineOnBackPressed} onChange={(value) => onChange('DefineOnBackPressed', value)} />
      <CheckBox {...fields.hidden} onChange={(value) => onChange('hidden', value)} />
      <CheckBox {...fields.login_screen} onChange={(value) => onChange('login_screen', value)} />

      <div className="btn-group modal-btn">
        <Button large={true}><span style={{ color: '#fff' }} onClick={saveElementData}>Save</span></Button>
      </div>
    </div>
  )
}