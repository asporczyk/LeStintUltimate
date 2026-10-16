import styled from 'styled-components'

export const RacesListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  width: 100%;
`

export const EmptyList = styled.p`
  padding: 2rem 1rem;
  text-align: center;
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.colors.textMuted};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
`
