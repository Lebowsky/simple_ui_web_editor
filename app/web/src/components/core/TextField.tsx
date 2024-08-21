import { InputGroup } from "@blueprintjs/core"
import { useState } from "react"

interface ITextFieldProps {
  value: string
  name: string
  text: string
  description?: string
  onChange(value: string): void
}
const TextField = (props: ITextFieldProps) => {
  return (
    <div className="param active" style={{display: 'block'}}>
      <InputGroup
        placeholder={props.description}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </div>
  )
}

export default TextField