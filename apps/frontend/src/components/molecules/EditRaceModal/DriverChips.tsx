import { useState, useRef, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  DriverChipsContainer,
  DriverChip,
  RemoveChipButton,
  DriverInput
} from './DriverChips.styles'

interface DriverChipsProps {
  drivers: string[]
  onChange: (drivers: string[]) => void
  placeholder?: string
}

export function DriverChips({ drivers, onChange, placeholder }: DriverChipsProps) {
  const { t } = useTranslation('raceDetails')
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addDriver = (name: string) => {
    const trimmedName = name.trim()
    if (trimmedName && trimmedName.length <= 50 && !drivers.includes(trimmedName)) {
      onChange([...drivers, trimmedName])
    }
    setInputValue('')
  }

  const removeDriver = (name: string) => {
    onChange(drivers.filter(d => d !== name))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addDriver(inputValue)
    } else if (e.key === 'Backspace' && inputValue === '' && drivers.length > 0) {
      removeDriver(drivers[drivers.length - 1])
    }
  }

  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  return (
    <DriverChipsContainer onClick={handleContainerClick}>
      {drivers.map(driver => (
        <DriverChip key={driver}>
          {driver}
          <RemoveChipButton
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              removeDriver(driver)
            }}
          >
            ×
          </RemoveChipButton>
        </DriverChip>
      ))}
      <DriverInput
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => inputValue.trim() && addDriver(inputValue)}
        placeholder={drivers.length === 0 ? (placeholder || t('driversPlaceholder')) : ''}
        maxLength={50}
      />
    </DriverChipsContainer>
  )
}
