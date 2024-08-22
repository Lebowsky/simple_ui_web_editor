import { useEffect, KeyboardEvent } from "react"
import { IMainContextProvider, useMainContext } from "../../context/MainContext"
import { contextTypes } from "../../models/globalContext"
import { ConfigModelsFactory } from "../../utils/configModelsFactory"
import { ProcessesItemModal } from "./ProcessesItemModal"

export const ModalsWrapper = () => {
  const { modalVisible, currentModalItem } = useMainContext() as IMainContextProvider

  return (
    <div id="modals-wrap" className={modalVisible ? "active" : ''}>
      {currentModalItem && currentModalItem.contextType == contextTypes.processes && <ProcessesItemModal title="Process" path="path" element={currentModalItem} />}
    </div>
  )
}