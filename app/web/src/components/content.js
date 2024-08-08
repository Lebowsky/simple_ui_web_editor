const Content = () => {
  return (
    `
      <div class="content">
        <div class="header">
          <div class="logo"><img src="logo.png" alt="Simple Logo"></div>
        </div>
        <span class="file-path"></span>
        <div class="main-conf-wrap">
          <div class="tabs">
            <div class="tab active" data-tab-id="main-conf-common">Common</div>
            <div class="tab" data-tab-id="main-conf-process">Processes</div>
            <div class="tab" data-tab-id="main-conf-main-menu">Main menu</div>
            <div class="tab" data-tab-id="main-conf-properties">Properties</div>
            <div class="tab" data-tab-id="main-conf-schedulers">Shedulers</div>
            <div class="tab" data-tab-id="main-conf-python-files">Python files</div>
            <div class="tab" data-tab-id="main-conf-media-files">Media files</div>
            <div class="tab" data-tab-id="main-conf-common-handlers">Common handlers</div>
          </div>
          <section id="main-conf-common" class="active">
            <div class="section-header">Common<i class="fa fa-angle-up" aria-hidden="true"></i></div>
            <div class="list-wrap show">
              <ul class="list form configuration">
                <li class="param">
                  <div>
                    <label for="ConfigurationName">Configuration-name</label>
                    <input type="text" name="ConfigurationName" id="ConfigurationName"
                      data-param-name="ConfigurationName">
                  </div>
                  <div>
                    <label for="ConfigurationVersion">Version</label>
                    <input type="text" name="ConfigurationVersion" id="ConfigurationVersion"
                      data-param-name="ConfigurationVersion">
                  </div>
                </li>
                <li class="param">
                  <div class="textarea-param-wrapper">
                    <label for="ConfigurationDescription">Description</label>
                    <textarea class="textarea-param" id="ConfigurationDescription" name="ConfigurationDescription"
                      data-param-name="ConfigurationDescription" rows="10">
                    </textarea>
                  </div>
                </li>
              </ul>
            </div>
          </section>
          <section id="main-conf-process">
            <div class="section-header">Processes<i class="fa fa-angle-up" aria-hidden="true"></i></div>
            <div class="list-wrap show">
              <ul class="list" id="processes">No process</ul>
            </div>
          </section>
          <section id="main-conf-main-menu">
            <div class="section-header">Main menu<i class="fa fa-angle-up" aria-hidden="true"></i></div>
            <div class="list-wrap show">
              <ul class="list" id="main-menu">No Items</ul>
            </div>
          </section>
          <section id="main-conf-properties">
            <div class="section-header">Properties<i class="fa fa-angle-up" aria-hidden="true"></i></div>
            <div class="list-wrap show">
              <ul class="list form configuration">
                <li class="param">
                  <div>
                    <label for="vendor">Vendor</label>
                    <input type="text" name="vendor" id="vendor" data-param-name="vendor">
                  </div>
                  <div>
                    <label for="vendor_url">Vendor URL</label>
                    <input type="text" name="vendor_url" id="vendor_url" data-param-name="vendor_url">
                  </div>
                </li>
                <li class="param">
                  <div>
                    <label for="vendor-login">Vendor login (Basic)</label>
                    <input type="text" name="vendor-login" id="vendor-login">
                  </div>
                  <div>
                    <label for="vendor-password">Vendor password (Basic)</label>
                    <input type="password" name="vendor-password" id="vendor-password">
                  </div>
                </li>
                <li class="param">
                  <label for="vendor_auth">Vendor raw authorization string</label>
                  <input type="text" name="vendor-auth" id="vendor_auth" data-param-name="vendor_auth" readonly>
                </li>
              </ul>
            </div>
          </section>
          <section id="main-conf-schedulers">
            <div class="section-header">Shedulers<i class="fa fa-angle-up" aria-hidden="true"></i></div>
            <div class="list-wrap show">
              <ul class="list" id="shedulers">No Items</ul>
            </div>
          </section>
          <section id="main-conf-python-files">
            <div class="section-header">Python files<i class="fa fa-angle-up" aria-hidden="true"></i></div>
            <div class="list-wrap show">
              <ul class="list">
                <li>
                  <button id="open-py-handlers-file" onclick="pickHandlersFile()">Open file</button>
                  <label>Handlers file (Python)</label>
                <li>
                </li class="param">
                <span id="py-handlers-file-path" data-param-name="pyHandlersPath">&lt;Not selected&gt;</span>
                </li>
              </ul>
              <ul class="list" id="py-files">No Items</ul>
            </div>
          </section>
          <section id="main-conf-media-files">
            <div class="section-header">Media files<i class="fa fa-angle-up" aria-hidden="true"></i>
            </div>
            <div class="list-wrap show">
              <ul class="list" id="media-files">No Items</ul>
            </div>
          </section>
          <section id="main-conf-common-handlers">
            <div class="section-header">Common handlers<i class="fa fa-angle-up" aria-hidden="true"></i></div>
            <div class="list-wrap show">
              <ul class="list" id="common-handlers">No Items</ul>
            </div>
          </section>
        </div>
      </div>
    `
  )
}

export default Content