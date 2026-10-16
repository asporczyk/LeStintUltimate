import styled from 'styled-components'

export const InputGroupContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  width: 100%;
`

export const InputRow = styled.div`
  display: flex;
  gap: 0.75rem;
`

export const ValidationError = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.8125rem;
  text-align: left;
`

export const AddText = styled.span`
  @media (max-width: 480px) {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
`
