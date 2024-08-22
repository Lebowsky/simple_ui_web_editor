import { Button } from '@blueprintjs/core';
import { useConfigurationContext, IConfigurationContext } from '../../../context/ConfigurationContext';
import { contextTypes } from '../../../models/globalContext';
import { ConfigModelsFactory } from '../../../utils/configModelsFactory';
import { ListItemProcess } from '../../core/ListItemProcess';


export const ProcessesSection = () => {
  const { globalContext } = useConfigurationContext() as IConfigurationContext
  const processes = globalContext?.processes.all() || []

  const btnAddClick = () => {
    const factory = new ConfigModelsFactory()
    const newElement = factory.createNew(contextTypes.processes)

    // const modal = new ElementModal(element);
    // modal.render().addClass('edited').addClass('new-element').show();
  }

  return (
    <section id='main-conf-process-new' className='active'>
      <div className='section-header'>Processes<i className='fa fa-angle-up' aria-hidden='true'></i></div>
      <div className='list-wrap show'>
        <ul className='list ui-sortable' data-id='1'>
          <div className='btn-group'>
            <Button><span style={{ color: '#fff' }}>Add</span></Button>
            <Button><span style={{ color: '#fff' }}>Add CV</span></Button>
            <Button><span style={{ color: '#fff' }}>Paste</span></Button>
          </div>
          <div style={{ overflow: 'auto', height: '55vh' }}>
            {processes.length
              ? processes.map(el => (<ListItemProcess label={el.content.ProcessName} key={el.id} listItem={el} />))
              : <div style={{ paddingTop: 15 }}><span>No Items</span></div>}
          </div>
        </ul>
      </div>
    </section>
  )
}
