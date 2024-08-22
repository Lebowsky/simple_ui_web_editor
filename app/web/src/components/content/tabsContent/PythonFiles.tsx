
export const PythonFilesSection = () => {
  return (
    <section id='main-conf-python-files' className='active'>
      <div className='section-header'>Python files<i className='fa fa-angle-up' aria-hidden='true'></i></div>
      <div className='list-wrap show'>
        <ul className='list'>
          <li>
            <button id='open-py-handlers-file'>Open file</button>
            <label>Handlers file (Python)</label>
            <span className='param'></span>
            <span id='py-handlers-file-path' data-param-name='pyHandlersPath'>&lt;Not selected&gt;</span>
          </li>
        </ul>
        <ul className='list' id='py-files'>No Items</ul>
      </div>
    </section>
  )
}
