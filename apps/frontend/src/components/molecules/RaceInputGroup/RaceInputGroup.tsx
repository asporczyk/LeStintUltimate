import { useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { TextButton } from 'components/atoms/TextButton/TextButton'
import { TextInput } from 'components/atoms/TextInput/TextInput.styles'
import { InputGroupContainer, AddText, AddIcon } from './RaceInputGroup.styles'
import PlusIcon from 'assets/svg/plus.svg'

interface RaceInputGroupProps {
  onAdd: (value: string) => void
}

export function RaceInputGroup({ onAdd }: RaceInputGroupProps) {
  const { t } = useTranslation('home')
  const [value, setValue] = useState('')

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onAdd(value)
      setValue('')
    }
  }

  const handleAdd = () => {
    onAdd(value)
    setValue('')
  }

  return (
    <InputGroupContainer>
      <TextInput
        type="text"
        placeholder={t('race-name-placeholder')}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <TextButton onClick={handleAdd}>
        <AddText>{t('add-race')}</AddText>
        <AddIcon src={PlusIcon} alt="" />
      </TextButton>
    </InputGroupContainer>
  )
}
