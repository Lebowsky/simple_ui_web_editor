interface IParamsRowProps {
  children: React.ReactNode
}

export const ParamsRow = ({ children }: IParamsRowProps) => {
  return (
    <li className="param">
      {children}
    </li>
  )
}