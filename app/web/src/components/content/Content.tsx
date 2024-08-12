const Content = () => {
  return (
    <>
      <div className="content">
        <div className="header">
          <div className="logo"><img src="logo.png" alt="Simple Logo" /></div>
        </div>
        <span className="file-path"></span>
        <div className="main-conf-wrap">
          <div className="tabs">
            <div className="tab active" data-tab-id="main-conf-common">Common</div>
            <div className="tab" data-tab-id="main-conf-process">Processes</div>
            <div className="tab" data-tab-id="main-conf-main-menu">Main menu</div>
            <div className="tab" data-tab-id="main-conf-properties">Properties</div>
            <div className="tab" data-tab-id="main-conf-schedulers">Shedulers</div>
            <div className="tab" data-tab-id="main-conf-python-files">Python files</div>
            <div className="tab" data-tab-id="main-conf-media-files">Media files</div>
            <div className="tab" data-tab-id="main-conf-common-handlers">Common handlers</div>
          </div>
          <section id="main-conf-common" className="active">
            <div className="section-header">Common<i className="fa fa-angle-up" aria-hidden="true"></i></div>
            <div className="list-wrap show">
              <ul className="list form configuration">
                <li className="param">
                  <div>
                    <label htmlFor="ConfigurationName">Configuration-name</label>
                    <input type="text" name="ConfigurationName" id="ConfigurationName" data-param-name="ConfigurationName" />
                  </div>
                  <div>
                    <label htmlFor="ConfigurationVersion">Version</label>
                    <input type="text" name="ConfigurationVersion" id="ConfigurationVersion" data-param-name="ConfigurationVersion" />
                  </div>
                </li>
                <li className="param">
                  <div className="textarea-param-wrapper">
                    <label htmlFor="ConfigurationDescription">Description</label>
                    <textarea className="textarea-param" id="ConfigurationDescription" name="ConfigurationDescription" data-param-name="ConfigurationDescription" rows={10}>
                    </textarea>
                  </div>
                </li>
              </ul>
            </div>
          </section>
          <section id="main-conf-process">
            <div className="section-header">Processes<i className="fa fa-angle-up" aria-hidden="true"></i></div>
            <div className="list-wrap show">
              <ul className="list" id="processes">No process</ul>
            </div>
          </section>
          <section id="main-conf-main-menu">
            <div className="section-header">Main menu<i className="fa fa-angle-up" aria-hidden="true"></i></div>
            <div className="list-wrap show">
              <ul className="list" id="main-menu">No Items</ul>
            </div>
          </section>
          <section id="main-conf-properties">
            <div className="section-header">Properties<i className="fa fa-angle-up" aria-hidden="true"></i></div>
            <div className="list-wrap show">
              <ul className="list form configuration">
                <li className="param">
                  <div>
                    <label htmlFor="vendor">Vendor</label>
                    <input type="text" name="vendor" id="vendor" data-param-name="vendor" />
                  </div>
                  <div>
                    <label htmlFor="vendor_url">Vendor URL</label>
                    <input type="text" name="vendor_url" id="vendor_url" data-param-name="vendor_url" />
                  </div>
                </li>
                <li className="param">
                  <div>
                    <label htmlFor="vendor-login">Vendor login (Basic)</label>
                    <input type="text" name="vendor-login" id="vendor-login" />
                  </div>
                  <div>
                    <label htmlFor="vendor-password">Vendor password (Basic)</label>
                    <input type="password" name="vendor-password" id="vendor-password" />
                  </div>
                </li>
                <li className="param">
                  <label htmlFor="vendor_auth">Vendor raw authorization string</label>
                  <input type="text" name="vendor-auth" id="vendor_auth" data-param-name="vendor_auth" />
                </li>
              </ul>
            </div>
          </section>
          <section id="main-conf-schedulers">
            <div className="section-header">Shedulers<i className="fa fa-angle-up" aria-hidden="true"></i></div>
            <div className="list-wrap show">
              <ul className="list" id="shedulers">No Items</ul>
            </div>
          </section>
          <section id="main-conf-python-files">
            <div className="section-header">Python files<i className="fa fa-angle-up" aria-hidden="true"></i></div>
            <div className="list-wrap show">
              <ul className="list">
                <li>
                  <button id="open-py-handlers-file">Open file</button>
                  <label>Handlers file (Python)</label>
                  <li className="param"></li >
                  <span id="py-handlers-file-path" data-param-name="pyHandlersPath">&lt;Not selected&gt;</span>
                </li>
              </ul>
              <ul className="list" id="py-files">No Items</ul>
            </div>
          </section>
          <section id="main-conf-media-files">
            <div className="section-header">Media files<i className="fa fa-angle-up" aria-hidden="true"></i>
            </div>
            <div className="list-wrap show">
              <ul className="list" id="media-files">No Items</ul>
            </div>
          </section>
          <section id="main-conf-common-handlers">
            <div className="section-header">Common handlers<i className="fa fa-angle-up" aria-hidden="true"></i></div>
            <div className="list-wrap show">
              <ul className="list" id="common-handlers">No Items</ul>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

export default Content