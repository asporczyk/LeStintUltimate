import { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'

const SelectContainer = styled.div`
  position: relative;
  width: 100%;
`

const SelectButton = styled.button`
  width: 100%;
  padding: 10px 14px;
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 14px;
  border: 2px solid #334466;
  border-radius: 4px;
  background-color: rgba(0, 8, 51, 0.8);
  color: #fff;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    border-color: #556677;
  }

  &:focus {
    outline: none;
    border-color: #FF1D44;
    box-shadow: 0 0 20px rgba(255, 29, 68, 0.3);
  }
`

const SelectDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, #000833 0%, #001244 100%);
  border: 2px solid #334466;
  border-radius: 4px;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
`

const SelectOption = styled.button`
  width: 100%;
  padding: 10px 14px;
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 14px;
  background: transparent;
  color: #fff;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 29, 68, 0.2);
  }

  ${(props: any) => props.$selected && `
    background: rgba(255, 29, 68, 0.3);
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
      <SelectButton type="button" onClick={() => setIsOpen(!isOpen)}>
        <span>{selectedOption?.label || placeholder}</span>
        <ChevronIcon />
      </SelectButton>
      {isOpen && (
        <SelectDropdown>
          {options.map(option => (
            <SelectOption
              key={option.value}
              {...{ $selected: option.value === value } as any}
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
