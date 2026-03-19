import styled from 'styled-components'

export const DriverChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  min-height: 52px;
  border: 2px solid #334466;
  border-radius: 4px;
  background-color: rgba(0, 8, 51, 0.8);
  cursor: text;

  &:focus-within {
    border-color: #FF1D44;
    box-shadow: 0 0 20px rgba(255, 29, 68, 0.3);
  }
`

export const DriverChip = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: linear-gradient(180deg, #FF1D44 0%, #CC1536 100%);
  border-radius: 16px;
  font-size: 13px;
  color: #fff;
  font-family: 'Hanken Grotesk', sans-serif;
`

export const RemoveChipButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`

export const DriverInput = styled.input`
  flex: 1;
  min-width: 120px;
  padding: 4px;
  background: transparent;
  border: none;
  outline: none;
  font-size: 14px;
  color: #fff;
  font-family: 'Hanken Grotesk', sans-serif;

  &::placeholder {
    color: #556677;
  }
`
