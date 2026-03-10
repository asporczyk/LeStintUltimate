import styled from 'styled-components'

export const InputGroupContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    flex-wrap: wrap;
  }
`

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 200px;
  max-width: 500px;
`

export const ValidationError = styled.span`
  color: #e74c3c;
  font-size: 12px;
  display: block;
  max-width: 320px;
  margin: 0;
  padding: 0;
  text-align: left;
`

export const ButtonWrapper = styled.div`
  min-width: 120px;
`

export const AddText = styled.span`
  @media (max-width: 600px) {
    display: none;
  }
`

export const AddIcon = styled.img`
  display: none;

  @media (max-width: 600px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`
