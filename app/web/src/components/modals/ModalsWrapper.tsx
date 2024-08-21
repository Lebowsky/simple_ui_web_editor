import { IMainContextProvider, useMainContext } from "../../context/MainContext"
import { contextTypes } from "../../models/globalContext"
import { ConfigModelsFactory } from "../../utils/configModelsFactory"
import { ProcessesItemModal } from "./ProcessesItemModal"

export const ModalsWrapper = () => {
  const { modalVisible } = useMainContext() as IMainContextProvider

  const factory = new ConfigModelsFactory()
  const element = factory.createNew(contextTypes.processes)

  return (
    <div id="modals-wrap" className={modalVisible ? "active" : ''}>
      <ProcessesItemModal title="Process" path="path" element={element}></ProcessesItemModal>
    </div>
  )
}