import styled, { css, keyframes } from 'styled-components'
import { fieldStyles } from 'styles/theme'

const pop = keyframes`
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: none; }
`

export const PickerContainer = styled.div`
  position: relative;
  width: 100%;
`

// The closed field: an icon, the value and a chevron.
export const PickerTrigger = styled.button<{ $open: boolean }>`
  ${fieldStyles}
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  text-align: left;
  cursor: pointer;
  font-variant-numeric: tabular-nums;

  ${({ $open, theme }) => $open && css`
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primarySoft};
  `}

  & > svg {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`

export const TriggerPrefix = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMuted};
`

export const TriggerValue = styled.span<{ $placeholder?: boolean }>`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ $placeholder, theme }) => ($placeholder ? theme.colors.textMuted : theme.colors.text)};

  small {
    margin-left: 0.25rem;
    font-size: 0.6875rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary};
  }
`

export const Popover = styled.div<{ $align?: 'left' | 'right'; $width?: string }>`
  position: absolute;
  top: calc(100% + 6px);
  ${({ $align }) => ($align === 'right' ? 'right: 0;' : 'left: 0;')}
  z-index: 100;
  width: ${({ $width }) => $width ?? '100%'};
  max-width: calc(100vw - 2rem);
  padding: 0.5rem;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.colors.shadow};
  animation: ${pop} 0.12s ease-out;
`

// One choice in a picker: a time, a day.
export const PickerCell = styled.button<{ $selected?: boolean; $today?: boolean; $muted?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 2rem;
  padding: 0.25rem;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: transparent;
  color: ${({ $muted, theme }) => ($muted ? theme.colors.textMuted : theme.colors.text)};
  font-family: inherit;
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;

  &:hover:not(:disabled),
  &[data-active='true'] {
    background: ${({ theme }) => theme.colors.surfaceRaised};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: -2px;
  }

  &:disabled {
    opacity: 0.3;
    cursor: default;
  }

  ${({ $today, theme }) => $today && css`
    border-color: ${theme.colors.borderStrong};
  `}

  ${({ $selected, theme }) => $selected && css`
    &, &:hover:not(:disabled), &[data-active='true'] {
      background: ${theme.colors.primary};
      color: ${theme.colors.onPrimary};
      font-weight: 700;
    }
  `}
`
