import styled from 'styled-components'

export const AvailabilityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

export const AvailabilityDriverGroup = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 0.5rem;

  @media (max-width: 500px) {
    grid-template-columns: minmax(0, 1fr);
  }
`

export const AvailabilityDriver = styled.span`
  padding-top: 0.625rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: 500px) {
    padding-top: 0;
  }
`

export const AvailabilityBlocks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`

export const AvailabilityRow = styled.div`
  display: grid;
  grid-template-columns: 9.5rem 9.5rem 2rem;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 500px) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 2rem;
  }
`

export const RemoveBlockButton = styled.button`
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 50%;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.surfaceHover};
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
`

export const AddBlockButton = styled.button`
  align-self: flex-start;
  padding: 0.125rem 0;
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`
