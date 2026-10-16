import styled from 'styled-components'

export const DriverChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
  min-height: 2.75rem;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radius.sm};
  background-color: ${({ theme }) => theme.colors.inputBg};
  cursor: text;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primarySoft};
  }
`

export const DriverChip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.375rem 0.25rem 0.75rem;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.onPrimary};
`

export const RemoveChipButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  background: rgba(255, 255, 255, 0.22);
  border: none;
  border-radius: 50%;
  color: inherit;
  cursor: pointer;
  font-size: 0.75rem;
  line-height: 1;

  &:hover {
    background: rgba(255, 255, 255, 0.38);
  }
`

export const DriverInput = styled.input`
  flex: 1;
  min-width: 120px;
  padding: 0.25rem;
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.colors.text};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`
