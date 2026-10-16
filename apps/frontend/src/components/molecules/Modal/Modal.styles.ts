import styled, { keyframes } from 'styled-components'
import { fieldStyles } from 'styles/theme'

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const rise = keyframes`
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
  to { opacity: 1; transform: none; }
`

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlay};
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
  animation: ${fadeIn} 0.15s ease-out;
`

export const ModalContent = styled.div.attrs({ role: 'dialog', 'aria-modal': true })<{ $width?: string }>`
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  padding: 1.5rem;
  border-radius: ${({ theme }) => theme.radius.lg};
  max-width: ${({ $width }) => $width ?? '480px'};
  width: 100%;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-top: 3px solid ${({ theme }) => theme.colors.primary};
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.35);
  animation: ${rise} 0.18s ease-out;

  @media (max-width: 500px) {
    padding: 1.25rem 1rem;
  }
`

export const ModalTitle = styled.h2`
  margin: 0 0 1.25rem;
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text};
`

export const ModalText = styled.p`
  margin: 0 0 1.5rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const FormRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;

  @media (max-width: 500px) {
    flex-direction: column;
  }
`

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  flex: 1;
  min-width: 140px;
`

export const Label = styled.label`
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const Input = styled.input`
  ${fieldStyles}
`

export const NumberInput = styled.input`
  ${fieldStyles}
  font-variant-numeric: tabular-nums;
`

export const Select = styled.select`
  ${fieldStyles}
  cursor: pointer;
`

export const DriversTextarea = styled.textarea`
  ${fieldStyles}
  resize: vertical;
  min-height: 80px;
`

export const ModalButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 0.5rem;

  @media (max-width: 400px) {
    flex-direction: column-reverse;

    button {
      width: 100%;
    }
  }
`

export const ErrorText = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.danger};
`

// Marks a value the app set by itself, e.g. fuel matched to the finish.
export const AutoBadge = styled.span`
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.successSoft};
  color: ${({ theme }) => theme.colors.success};
  font-size: 0.75rem;
  font-weight: 600;

  svg {
    width: 0.875rem;
    height: 0.875rem;
    flex-shrink: 0;
  }
`

export const FieldHint = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textMuted};
`

export const InputWithUnit = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`

export const InputUnit = styled.span`
  position: absolute;
  right: 0.875rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textMuted};
  pointer-events: none;
`

export const InputWithUnitStyle = styled(NumberInput)`
  padding-right: 2.75rem;
`

export const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

// $limit (%): values above it are blocked and the track shows that part hatched.
export const Slider = styled.input<{ $limit?: number }>`
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: ${({ $limit = 100, theme }) => $limit >= 100
    ? theme.colors.border
    : `linear-gradient(90deg, ${theme.colors.border} 0 ${$limit}%, transparent ${$limit}%),
       repeating-linear-gradient(135deg, ${theme.colors.primarySoft} 0 4px, transparent 4px 8px)`};
  appearance: none;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.primary};

  &::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
    border: 2px solid ${({ theme }) => theme.colors.surface};
    cursor: pointer;
    transition: transform 0.15s ease;
  }

  &::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
    border: 2px solid ${({ theme }) => theme.colors.surface};
    cursor: pointer;
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.15);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 4px;
  }
`

export const SliderValue = styled.span`
  min-width: 50px;
  text-align: right;
  font-size: 0.9375rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.text};
`

export const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 1rem;
`

export const CheckboxRow = styled.div`
  display: flex;
  gap: 0.75rem;
`

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
`

export const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.primary};
`
