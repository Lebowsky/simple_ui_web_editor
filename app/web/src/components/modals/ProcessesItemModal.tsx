interface IProcessesItemModalProps {
  title: string
  path: string
}
export const ProcessesItemModal = ({ title, path }: IProcessesItemModalProps) => {
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
      <div className='modal-content'></div>
    </div>
  )
}