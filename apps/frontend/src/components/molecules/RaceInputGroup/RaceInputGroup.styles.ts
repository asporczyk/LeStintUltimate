import styled from 'styled-components'

export const InputGroupContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    flex-wrap: wrap;
  }
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
