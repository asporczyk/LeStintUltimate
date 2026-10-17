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

// BMW M4 GT3 from above, nose up: kidney grilles and slim headlights, a long hood with
// vents over the front wheels, the cabin set back, a fastback and the rear wing.
// Its wheels show what goes on each corner.
function CarOutline({ tires }: { tires: TireCompound[] }) {
  return (
    <CarView viewBox="0 0 60 120" aria-hidden="true">
      {CAR_WHEELS.map(({ x, y }, index) => (
        <CarWheel key={index} x={x} y={y} width="7" height="18" rx="2" $tire={tires[index]} />
      ))}
      {/* Mirrors: a short stalk and a rounded housing angled back, glass edge in front */}
      <CarBody d="M11 44 L9.4 46.4 L4.4 48.7 C3 49.4 2.8 51 3.9 51.7 C4.8 52.3 6 52 7 51.4 L9 50 C10 49.3 10.2 48.3 9.8 47.6 L11 46.2 Z" />
      <CarBody d="M49 44 L50.6 46.4 L55.6 48.7 C57 49.4 57.2 51 56.1 51.7 C55.2 52.3 54 52 53 51.4 L51 50 C50 49.3 49.8 48.3 50.2 47.6 L49 46.2 Z" />
      <CarLine d="M8.8 47.8 L4.8 49.7 M51.2 47.8 L55.2 49.7" />
      <CarBody d="M12 6 C14 3 20 2 30 2 C40 2 46 3 48 6 L50.5 12 C52 20 52 30 50.5 36 L49 42 L49 78 C51.5 82 52.5 88 52.5 94 L52.5 106 C52.5 110 50 112.5 46 113 L14 113 C10 112.5 7.5 110 7.5 106 L7.5 94 C7.5 88 8.5 82 11 78 L11 42 L9.5 36 C8 30 8 20 9.5 12 Z" />
      {/* Kidney grilles and headlights */}
      <CarDetail d="M23.5 3 L29 2.6 L29 7 L24 7.3 Z M36.5 3 L31 2.6 L31 7 L36 7.3 Z" />
      <CarDetail d="M11.5 8 L20 5.2 L19 8.5 L12 11 Z M48.5 8 L40 5.2 L41 8.5 L48 11 Z" />
      {/* Hood: power domes, centre vent and the louvres over the front wheels */}
      <CarLine d="M22.5 11 L21.5 41 M37.5 11 L38.5 41" />
      <CarDetail d="M26 14 L34 14 L33.5 25 L26.5 25 Z" />
      <CarLine d="M13 17 L18 17 M13 20.5 L18 20.5 M13 24 L18 24 M13 27.5 L18 27.5 M42 17 L47 17 M42 20.5 L47 20.5 M42 24 L47 24 M42 27.5 L47 27.5" />
      {/* Door windows, from the A-pillar back to the fastback */}
      <CarDetail d="M14.3 45 L17.4 55.5 L19.4 80 C16.9 77.5 15 73 14.2 67 L13.2 52 Z M45.7 45 L42.6 55.5 L40.6 80 C43.1 77.5 45 73 45.8 67 L46.8 52 Z" />
      {/* Windscreen, roof edges and fastback */}
      <CarDetail d="M14.5 44 C20.5 40.5 39.5 40.5 45.5 44 L42.5 55 C35 53.8 25 53.8 17.5 55 Z" />
      <CarLine d="M17.5 55 L19.5 80 M42.5 55 L40.5 80" />
      <CarDetail d="M19.5 80 C26 79 34 79 40.5 80 L40 92 C34 93 26 93 20 92 Z" />
      {/* Rear wing on its swan-neck mounts */}
      <CarLine d="M23 93 L23 106 M37 93 L37 106" />
      <CarDetail d="M4 106 L56 106 L56 111.5 L4 111.5 Z" />
      <CarLine d="M4 103 L4 114 M56 103 L56 114" />
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
