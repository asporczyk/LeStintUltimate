import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { FormGroup, Label, FieldHint } from 'components/molecules/Modal/Modal.styles'
import { REPAIR_PARTS, REPAIR_TIMES, SUSPENSION_PARTS, calculateRepairTime, type RepairPart } from 'utils/repairs'

const SubLabel = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textMuted};
`

// Bodywork and wings in one row (stacked on phones); suspension two by two, each corner
// where it is on the car.
const Options = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns}, 1fr);
  gap: 0.375rem;

  @media (max-width: 500px) {
    grid-template-columns: ${({ $columns }) => $columns === 2 ? '1fr 1fr' : '1fr'};
  }
`

const Option = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  min-height: 2.25rem;
  padding: 0.375rem 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.borderStrong};
  background: ${({ $active, theme }) => $active ? theme.colors.primarySoft : theme.colors.inputBg};
  color: ${({ $active, theme }) => $active ? theme.colors.text : theme.colors.textSecondary};
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`

const Seconds = styled.span`
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textMuted};
`

const BODY_PARTS = REPAIR_PARTS.filter(part => !(SUSPENSION_PARTS as readonly string[]).includes(part))

interface RepairFieldProps {
  value: string[]
  onChange: (repairs: string[]) => void
}

// Damage to repair at the pit stop before the stint, part by part, with the time it adds.
export function RepairField({ value, onChange }: RepairFieldProps) {
  const { t } = useTranslation('raceDetails')
  const selected = new Set(value)
  // Kept in REPAIR_PARTS order so the saved list doesn't depend on the clicks.
  const toggle = (part: RepairPart) =>
    onChange(REPAIR_PARTS.filter(p => p === part ? !selected.has(p) : selected.has(p)))
  const total = Math.round(calculateRepairTime(value))

  const renderOption = (part: RepairPart) => (
    <Option
      key={part}
      type="button"
      aria-pressed={selected.has(part)}
      $active={selected.has(part)}
      onClick={() => toggle(part)}
    >
      {t(`repairPart.${part}`)}
      <Seconds>+{REPAIR_TIMES[part]} s</Seconds>
    </Option>
  )

  return (
    <FormGroup>
      <Label as="span">{t('repairs')}</Label>
      <Options role="group" aria-label={t('repairs')} $columns={BODY_PARTS.length}>
        {BODY_PARTS.map(renderOption)}
      </Options>
      <SubLabel>{t('suspension')}</SubLabel>
      <Options role="group" aria-label={t('suspension')} $columns={2}>
        {SUSPENSION_PARTS.map(renderOption)}
      </Options>
      <FieldHint role="status">
        {total > 0 ? t('repairTime', { seconds: total }) : t('noRepairs')}
      </FieldHint>
    </FormGroup>
  )
}
