import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { FormGroup, Label } from 'components/molecules/Modal/Modal.styles'
import { tireColor } from 'components/molecules/StintSchedule/ScheduleCard.styles'
import { TIRE_COMPOUNDS, TIRE_KEYS, compoundOf, type TireChange, type TireCompound } from 'utils/tires'

// Buttons share the row by their text length; two by two on phones.
const Options = styled.div`
  display: flex;
  gap: 0.375rem;

  @media (max-width: 500px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
`

const Option = styled.button<{ $active: boolean }>`
  flex: 1 1 auto;
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

// Small wheel in the compound's color; an empty outline for "no change".
const Swatch = styled.span<{ $tire: TireCompound }>`
  width: 0.5rem;
  height: 0.75rem;
  flex-shrink: 0;
  border-radius: 2px;
  border: 1.5px solid ${({ $tire, theme }) => $tire === '-' ? theme.colors.borderStrong : tireColor($tire, theme)};
  background: ${({ $tire, theme }) => $tire === '-' ? 'transparent' : tireColor($tire, theme)};
`

// Car seen from above between its wheels: front pickers left and right of the nose,
// rear ones by the tail. Rows are spaced so each picker sits beside its wheel.
const Wheels = styled.div`
  display: grid;
  grid-template-columns: auto auto auto;
  grid-template-rows: auto auto;
  justify-content: center;
  column-gap: 1.25rem;
  row-gap: 2.5rem;
  margin-top: 0.5rem;

  @media (max-width: 400px) {
    column-gap: 0.75rem;
  }
`

// Two by two: no change and new on top, used and wet below.
const Wheel = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 2rem);
  gap: 0.375rem;
`

const CarView = styled.svg`
  grid-column: 2;
  grid-row: 1 / 3;
  align-self: center;
  height: 11.25rem;
  width: auto;
  overflow: visible;
`

const CarBody = styled.path`
  fill: ${({ theme }) => theme.colors.surfaceRaised};
  stroke: ${({ theme }) => theme.colors.borderStrong};
  stroke-width: 1.5;
`

const CarDetail = styled.path`
  fill: ${({ theme }) => theme.colors.inputBg};
  stroke: ${({ theme }) => theme.colors.borderStrong};
  stroke-width: 1;
`

const CarLine = styled.path`
  fill: none;
  stroke: ${({ theme }) => theme.colors.borderStrong};
  stroke-width: 1;
  stroke-linecap: round;
`

const CarWheel = styled.rect<{ $tire: TireCompound }>`
  fill: ${({ $tire, theme }) => $tire === '-' ? theme.colors.bg : tireColor($tire, theme)};
  stroke: ${({ $tire, theme }) => $tire === '-' ? theme.colors.borderStrong : tireColor($tire, theme)};
  stroke-width: 1.5;
  transition: fill 0.15s ease, stroke 0.15s ease;
`

// Wheels on the outline, in the order of TIRE_KEYS, at the height of their pickers.
// They stick out past the body so the compound's color shows.
const CAR_WHEELS = [{ x: 4, y: 14 }, { x: 49, y: 14 }, { x: 2, y: 88 }, { x: 51, y: 88 }]

// GT3 car from above, nose up: round headlights and hood vents, cabin glass,
// wide rear haunches and the rear wing. Its wheels show what goes on each corner.
function CarOutline({ tires }: { tires: TireCompound[] }) {
  return (
    <CarView viewBox="0 0 60 120" aria-hidden="true">
      {CAR_WHEELS.map(({ x, y }, index) => (
        <CarWheel key={index} x={x} y={y} width="7" height="18" rx="2" $tire={tires[index]} />
      ))}
      {/* Mirrors */}
      <CarDetail d="M12 45 L7 43 C6 43 5.5 44 5.5 45 L6 47 C6 48 7 48.5 8 48.5 L12 48 Z" />
      <CarDetail d="M48 45 L53 43 C54 43 54.5 44 54.5 45 L54 47 C54 48 53 48.5 52 48.5 L48 48 Z" />
      <CarBody d="M13 9 C15 4 22 3 30 3 C38 3 45 4 47 9 L50 15 C51.5 21 51.5 29 50 35 L48 42 L48 76 C51 80 52.5 86 52.5 94 L52.5 104 C52.5 109 50 112 46 112.5 L14 112.5 C10 112 7.5 109 7.5 104 L7.5 94 C7.5 86 9 80 12 76 L12 42 L10 35 C8.5 29 8.5 21 10 15 Z" />
      {/* Headlights */}
      <CarDetail d="M12.5 11 a3.5 3.5 0 1 0 7 0 a3.5 3.5 0 1 0 -7 0 Z M40.5 11 a3.5 3.5 0 1 0 7 0 a3.5 3.5 0 1 0 -7 0 Z" />
      {/* Hood vents */}
      <CarDetail d="M22 11 L27 10.5 L27 22 L23.5 20 Z M38 11 L33 10.5 L33 22 L36.5 20 Z" />
      {/* Windscreen, roof and rear window */}
      <CarDetail d="M15.5 38 C21 34.5 39 34.5 44.5 38 L41 50 C34 48.5 26 48.5 19 50 Z" />
      <CarLine d="M19 50 L20.5 78 M41 50 L39.5 78 M27 49.5 L27 77 M33 49.5 L33 77" />
      <CarDetail d="M20.5 78 C26 77 34 77 39.5 78 L40 94 C34 95 26 95 20 94 Z" />
      {/* Rear wing on its swan-neck mounts */}
      <CarLine d="M23 96 L23 106 M37 96 L37 106" />
      <CarDetail d="M5 106 L55 106 L55 111 L5 111 Z" />
      <CarLine d="M5 104 L5 113 M55 104 L55 113" />
    </CarView>
  )
}

// One compound for one wheel: just the swatch, named by aria-label and title.
const WheelOption = styled(Option)`
  flex: 0 0 auto;
  min-height: 2rem;
  width: 2rem;
  padding: 0;
`

const SubLabel = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textMuted};
`

interface TireFieldProps {
  value: TireChange
  // Gets only the wheels that changed, to merge into the form.
  onChange: (tires: Partial<TireChange>) => void
}

type WheelKey = typeof TIRE_KEYS[number]

// Tire change at the pit stop, wheel by wheel: nothing, new, used or wets on each.
// Every change takes the same pit time; only new tires come out of the race's allowance.
export function TireField({ value, onChange }: TireFieldProps) {
  const { t } = useTranslation('raceDetails')
  const tires = TIRE_KEYS.map(key => compoundOf(value[key]))
  // The "all wheels" choice is lit only while every wheel has the same compound.
  const allSame = tires.every(tire => tire === tires[0]) ? tires[0] : null

  const setAll = (next: TireCompound) => onChange({ tireFL: next, tireFR: next, tireRL: next, tireRR: next })
  const setWheel = (key: WheelKey, next: TireCompound) => onChange({ [key]: next })

  return (
    <FormGroup>
      <Label as="span">{t('tiresToChange')}</Label>
      <SubLabel>{t('allWheels')}</SubLabel>
      <Options role="radiogroup" aria-label={t('allWheels')}>
        {TIRE_COMPOUNDS.map(option => (
          <Option
            key={option}
            type="button"
            role="radio"
            aria-checked={allSame === option}
            $active={allSame === option}
            onClick={() => setAll(option)}
          >
            <Swatch $tire={option} aria-hidden="true" />
            {t(`tireChangeOption.${option}`)}
          </Option>
        ))}
      </Options>
      <Wheels>
        {TIRE_KEYS.map(key => (
          <Wheel key={key} role="radiogroup" aria-label={t(`wheel.${key}`)}>
            {TIRE_COMPOUNDS.map(option => {
              const name = t(`tireChangeOption.${option}`)
              return (
                <WheelOption
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={compoundOf(value[key]) === option}
                  aria-label={name}
                  title={`${t(`wheel.${key}`)}: ${name}`}
                  $active={compoundOf(value[key]) === option}
                  onClick={() => setWheel(key, option)}
                >
                  <Swatch $tire={option} aria-hidden="true" />
                </WheelOption>
              )
            })}
          </Wheel>
        ))}
        <CarOutline tires={tires} />
      </Wheels>
    </FormGroup>
  )
}
