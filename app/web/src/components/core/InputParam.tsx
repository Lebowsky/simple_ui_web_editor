
interface IInputParamProps{
  paramName: string,
  label: string
}
export const InputParam = ({ paramName, label }: IInputParamProps) => {
  return (
    <div>
      <label htmlFor={paramName}>{label}</label>
      <input type="text" name={paramName} id={paramName} data-param-name={paramName} />
    </div>
  )
}