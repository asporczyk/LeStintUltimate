import styled from 'styled-components'
import { CheckIcon } from 'components/atoms/CheckIcon/CheckIcon'

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
  flex-shrink: 0;
  border: 2px solid ${({ $checked, theme }) => $checked ? theme.colors.primary : theme.colors.borderStrong};
  border-radius: 4px;
  background: ${({ $checked, theme }) => $checked ? theme.colors.primary : theme.colors.inputBg};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  input:focus-visible + & {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  svg {
    opacity: ${props => props.$checked ? 1 : 0};
    transition: opacity 0.2s ease;
  }
`

const LabelText = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`

interface CustomCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}

export function CustomCheckbox({ checked, onChange, label }: CustomCheckboxProps) {
  return (
    <CheckboxWrapper>
      <HiddenCheckbox
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <CheckboxBox $checked={checked}>
        <CheckIcon size={12} color="white" />
      </CheckboxBox>
      <LabelText>{label}</LabelText>
    </CheckboxWrapper>
  )
}
