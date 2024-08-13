import React from "react"
import { selectTab } from "../../handlers"

export const Tabs = () => {
  const onClick = (e: React.MouseEvent<HTMLElement>) => {
    selectTab(e.target)
  }

  return (
    <div className="tabs">
      <div className="tab active" data-tab-id="main-conf-common" onClick={(e) => onClick(e)}>Common</div>
      <div className="tab" data-tab-id="main-conf-process" onClick={(e) => onClick(e)}>Processes</div>
      <div className="tab" data-tab-id="main-conf-process-new" onClick={(e) => onClick(e)}>Processes new</div>
      <div className="tab" data-tab-id="main-conf-main-menu" onClick={(e) => onClick(e)}>Main menu</div>
      <div className="tab" data-tab-id="main-conf-properties" onClick={(e) => onClick(e)}>Properties</div>
      <div className="tab" data-tab-id="main-conf-schedulers" onClick={(e) => onClick(e)}>Shedulers</div>
      <div className="tab" data-tab-id="main-conf-python-files" onClick={(e) => onClick(e)}>Python files</div>
      <div className="tab" data-tab-id="main-conf-media-files" onClick={(e) => onClick(e)}>Media files</div>
      <div className="tab" data-tab-id="main-conf-common-handlers" onClick={(e) => onClick(e)}>Common handlers</div>
    </div>
  )
}