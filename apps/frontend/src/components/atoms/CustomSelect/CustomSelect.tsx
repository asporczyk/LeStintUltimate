import { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { fieldStyles } from 'styles/theme'

const SelectContainer = styled.div`
  position: relative;
  width: 100%;
`

const SelectButton = styled.button`
  ${fieldStyles}
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;

  svg {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`

const SelectDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radius.sm};
  box-shadow: ${({ theme }) => theme.colors.shadow};
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
`

const SelectOption = styled.button<{ $selected: boolean }>`
  width: 100%;
  padding: 10px 14px;
  font-size: 0.9375rem;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }

  ${({ $selected, theme }) => $selected && `
    &, &:hover {
      background: ${theme.colors.primarySoft};
      color: ${theme.colors.primary};
      font-weight: 600;
    }
  `}
`

const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
)

interface SelectOption {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
}

export function CustomSelect({ value, onChange, options, placeholder = '--' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <SelectContainer ref={containerRef}>
      <SelectButton
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => { if (e.key === 'Escape') setIsOpen(false) }}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <ChevronIcon />
      </SelectButton>
      {isOpen && (
        <SelectDropdown role="listbox">
          {options.map(option => (
            <SelectOption
              key={option.value}
              $selected={option.value === value}
              role="option"
              aria-selected={option.value === value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
            >
              {option.label}
            </SelectOption>
          ))}
        </SelectDropdown>
      )}
    </SelectContainer>
  )
}
