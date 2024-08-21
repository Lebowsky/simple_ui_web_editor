import { Checkbox } from "@blueprintjs/core"

interface ICheckBoxProps {
  value: string
  text: string
  name: string
  description?: string
  onChange(value: boolean): void
}

const CheckBox = (props: ICheckBoxProps) => {
  const checked = Boolean(props.value)
  return (
    <div className="param active">
      <Checkbox 
        checked={checked} 
        label={props.text} 
        title={props.description} 
        onChange={(e) => props.onChange(e.target.checked)} 
        large={true}
      />
    </div>
  )
}

export default CheckBox