import { IConfigItem } from "../../models/configurationModels"

interface IInputParamProps{
  paramName: string,
  label: string
  configData?: IConfigItem
}
export const InputParam = ({ paramName, label, configData }: IInputParamProps) => {
  const value = configData?.content[paramName]
  const itemId = configData?.id
  return (
    <div>
      <label htmlFor={paramName}>{label}</label>
      <input type="text" name={paramName} id={paramName} data-param-name={paramName} data-id={itemId} value={value}/>
    </div>
  )
}