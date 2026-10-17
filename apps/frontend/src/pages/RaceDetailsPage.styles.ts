import styled from 'styled-components'
import { MOBILE_QUERY, fullBleedOnMobile } from 'styles/theme'

export const RaceDetailsContainer = styled.div`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem 1.25rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media ${MOBILE_QUERY} {
    padding: 0.75rem 1rem 3rem;
    gap: 1rem;
  }
`

export const TopBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`

export const TopBarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

export const RaceHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

export const PageTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.anton};
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text};
  overflow-wrap: anywhere;
`

export const RaceMeta = styled.p`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textMuted};

  &::before {
    content: '';
    width: 2.5rem;
    height: 3px;
    background: ${({ theme }) => theme.colors.primary};
    transform: skewX(-24deg);
  }
`

export const StatsGrid = styled.dl`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  overflow: hidden;
  ${fullBleedOnMobile}
`

export const Stat = styled.div<{ $wide?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.875rem 1rem;
  /* Cell dividers; the grid clips the ones on its outer edge. */
  box-shadow: 1px 1px 0 0 ${({ theme }) => theme.colors.border};
  grid-column: ${({ $wide }) => $wide ? '1 / -1' : 'auto'};
`

export const StatLabel = styled.dt`
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`

export const StatValue = styled.dd`
  font-size: 1.125rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.text};
`

export const DriverList = styled.dd`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.125rem;
  color: ${({ theme }) => theme.colors.textMuted};
`

export const DriverTag = styled.span`
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border: 1px solid ${({ theme }) => theme.colors.border};
`

export const DriverHours = styled.span`
  margin-left: 0.375rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 20vh 1rem;
  text-align: center;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`
