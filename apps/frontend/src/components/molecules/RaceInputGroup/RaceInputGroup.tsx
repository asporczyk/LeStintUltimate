import { useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { TextButton } from 'components/atoms/TextButton/TextButton'
import { TextInput } from 'components/atoms/TextInput/TextInput.styles'
import { InputGroupContainer, InputWrapper, ValidationError, ButtonWrapper, AddText, AddIcon } from './RaceInputGroup.styles'
import PlusIcon from 'assets/svg/plus.svg'

interface RaceInputGroupProps {
  onAdd: (value: string) => void
}

const MAX_NAME_LENGTH = 20
const LATIN_ALPHANUMERIC_REGEX = /^[a-zA-Z0-9\s\-_.,!?'()]*$/
const HAS_LETTER_OR_NUMBER = /[a-zA-Z0-9]/

export function RaceInputGroup({ onAdd }: RaceInputGroupProps) {
  const { t } = useTranslation('home')
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const validateValue = (val: string): string => {
    if (!val) return ''
    if (val.trim().length === 0 || !HAS_LETTER_OR_NUMBER.test(val)) {
      return t('race-name-required')
    }
    if (val.length > MAX_NAME_LENGTH) {
      return t('race-name-max-length', { max: MAX_NAME_LENGTH })
    }
    if (!LATIN_ALPHANUMERIC_REGEX.test(val)) {
      return t('race-name-invalid-chars')
    }
    return ''
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (newValue.length <= MAX_NAME_LENGTH) {
      setValue(newValue)
      setError(validateValue(newValue))
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !error && value) {
      onAdd(value)
      setValue('')
      setError('')
    }
  }

  const handleAdd = () => {
    if (!error && value) {
      onAdd(value)
      setValue('')
      setError('')
    }
  }

  return (
    <InputGroupContainer>
      <InputWrapper>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <TextInput
            type="text"
            placeholder={t('race-name-placeholder')}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            style={{ borderColor: error ? '#e74c3c' : undefined }}
          />
          <ButtonWrapper>
            <TextButton onClick={handleAdd} disabled={!!error || !value}>
              <AddText>{t('add-race')}</AddText>
              <AddIcon src={PlusIcon} alt="" />
            </TextButton>
          </ButtonWrapper>
        </div>
        {error && <ValidationError>{error}</ValidationError>}
      </InputWrapper>
    </InputGroupContainer>
  )
}
