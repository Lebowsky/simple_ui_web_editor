import { IConfigItemCreate, IConfigItemUpdate } from "../../models/configurationModels"

import TextField from "../core/TextField"
import CheckBox from "../core/CheckBox"
import { Button, InputGroup } from "@blueprintjs/core"
import { useEffect, useState } from "react"
import { DataItem } from "../../models/globalContext"
import { IMainContextProvider, useMainContext } from "../../context/MainContext"

interface IProcessesItemModalProps {
  title: string
  path: string
  element: IConfigItemCreate | IConfigItemUpdate
}
export const ProcessesItemModal = ({ title, path, element }: IProcessesItemModalProps) => {
  const { closeModal } = useMainContext() as IMainContextProvider

  useEffect(() => {
    const handleKeyPress = (
      event: any
    ) => {
      if (event.key === 'Escape') {
        closeModal()
        return;
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress!);
    };
  }, []);

  const saveElementData = () => {
    closeModal()
  }

  const closeCurrentModal = () => {
    closeModal()
  }
  return (
    <div className='modal active' data-modal-type='element'>
      <div className='close-modal' onClick={closeCurrentModal}>
        <i className='fa fa-times' aria-hidden='true'></i>
      </div>
      <div className='modal-head'>
        <div style={{ display: 'flex' }}>
          <Button><span style={{ color: '#fff' }} onClick={saveElementData}>Save</span></Button>
          <div className='top' style={{ width: '100%', justifyContent: 'center' }}>
            <h2 className='modal-title'>{title}<span className='edited'>*</span></h2>
          </div>
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

  return (
    <div>
      <div className="param active" style={{ display: 'block', width: '50%' }}>
        <InputGroup
          placeholder={fields.ProcessName.description}
          value={fields.ProcessName.value}
          onChange={(value) => onChange('ProcessName', value)}
        />
      </div>
      <div style={{ display: 'flex' }}>
        <CheckBox {...fields.DefineOnBackPressed} onChange={(value) => onChange('DefineOnBackPressed', value)} />
        <CheckBox {...fields.hidden} onChange={(value) => onChange('hidden', value)} />
      </div>
      <CheckBox {...fields.login_screen} onChange={(value) => onChange('login_screen', value)} />
    </div>
  )
}