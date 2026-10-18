import styled from 'styled-components'

export const DriverPills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.125rem;
`

export const DriverPill = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderStrong};
  }

  &[aria-expanded='true'] {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primarySoft};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  svg {
    width: 0.75rem;
    height: 0.75rem;
    transition: transform 0.15s ease;
  }

  &[aria-expanded='true'] svg {
    transform: rotate(180deg);
  }
`

export const DetailsPanel = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-top: 0.625rem;
  padding: 0.75rem 0.875rem;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border: 1px solid ${({ theme }) => theme.colors.border};
`

export const DetailsList = styled.dl`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.625rem 1rem;
  min-width: 0;
`

export const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
`

export const DetailLabel = styled.dt`
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`

export const DetailValue = styled.dd<{ $inherited?: boolean }>`
  font-size: 0.9375rem;
  font-weight: ${({ $inherited }) => $inherited ? 500 : 600};
  font-variant-numeric: tabular-nums;
  color: ${({ theme, $inherited }) => $inherited ? theme.colors.textSecondary : theme.colors.text};
`
