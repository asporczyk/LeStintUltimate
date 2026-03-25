import styled from 'styled-components'

const CheckboxWrapper = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
`

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
`

const CheckboxBox = styled.span<{ $checked: boolean }>`
  width: 20px;
  height: 20px;
  border: 2px solid ${props => props.$checked ? '#FF1D44' : '#334466'};
  border-radius: 4px;
  background: ${props => props.$checked ? '#FF1D44' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  svg {
    opacity: ${props => props.$checked ? 1 : 0};
    transition: opacity 0.2s ease;
  }
`

const LabelText = styled.span`
  font-size: 14px;
  color: #fff;
  font-family: 'Hanken Grotesk', sans-serif;
`

interface CustomCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

export function CustomCheckbox({ checked, onChange, label }: CustomCheckboxProps) {
  return (
    <CheckboxWrapper>
      <HiddenCheckbox
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <CheckboxBox $checked={checked}>
        <CheckIcon />
      </CheckboxBox>
      <LabelText>{label}</LabelText>
    </CheckboxWrapper>
  )
}
