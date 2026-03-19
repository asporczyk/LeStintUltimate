import styled from 'styled-components'

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

export const ModalContent = styled.div`
  background: linear-gradient(180deg, #000833 0%, #001244 100%);
  padding: 24px;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
`

export const ModalTitle = styled.h2`
  margin: 0 0 20px;
  font-size: 20px;
  color: #fff;
  font-family: 'Hanken Grotesk', sans-serif;
`

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const FormRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 500px) {
    flex-direction: column;
  }
`

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 140px;
`

export const Label = styled.label`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'Hanken Grotesk', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

export const Input = styled.input`
  font-family: 'Hanken Grotesk', sans-serif;
  padding: 10px 14px;
  font-size: 14px;
  border: 2px solid #334466;
  border-radius: 4px;
  background-color: rgba(0, 8, 51, 0.8);
  color: #fff;
  outline: none;
  transition: all 0.3s ease;

  &::placeholder {
    color: #556677;
  }

  &:focus {
    border-color: #FF1D44;
    box-shadow: 0 0 20px rgba(255, 29, 68, 0.3);
  }

  &[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1);
  }
`

export const DriversTextarea = styled.textarea`
  font-family: 'Hanken Grotesk', sans-serif;
  padding: 10px 14px;
  font-size: 14px;
  border: 2px solid #334466;
  border-radius: 4px;
  background-color: rgba(0, 8, 51, 0.8);
  color: #fff;
  outline: none;
  resize: vertical;
  min-height: 80px;
  transition: all 0.3s ease;

  &::placeholder {
    color: #556677;
  }

  &:focus {
    border-color: #FF1D44;
    box-shadow: 0 0 20px rgba(255, 29, 68, 0.3);
  }
`

export const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
`

export const ErrorText = styled.span`
  font-size: 12px;
  color: #FF1D44;
  font-family: 'Hanken Grotesk', sans-serif;
`

export const InputWithUnit = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`

export const InputUnit = styled.span`
  position: absolute;
  right: 12px;
  font-size: 14px;
  color: #556677;
  font-family: 'Hanken Grotesk', sans-serif;
  pointer-events: none;
`

export const InputWithUnitStyle = styled(Input)`
  padding-right: 40px;
`
