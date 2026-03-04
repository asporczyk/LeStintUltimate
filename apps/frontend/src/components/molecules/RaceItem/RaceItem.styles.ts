import styled from 'styled-components'

export const RaceItemContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #334466;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #FF1D44;
  }

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }
`

export const RaceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  text-align: left;

  @media (max-width: 600px) {
    flex: none;
  }
`

export const RaceName = styled.span`
  font-family: 'Hanken Grotesk', sans-serif;
  color: #fff;
  font-weight: 500;
`

export const RaceDate = styled.span`
  font-family: 'Hanken Grotesk', sans-serif;
  color: #667788;
  font-size: 0.85rem;
`

export const RaceActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;

  @media (max-width: 600px) {
    justify-content: flex-end;
  }
`
