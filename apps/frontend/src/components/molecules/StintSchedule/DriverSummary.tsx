import { useTranslation } from 'react-i18next'
import { type Stint } from 'types/Schedule'
import { formatHoursMinutes } from 'utils/time'
import { scheduleLength } from 'utils/schedule'
import { driverTotals, minimumDriverPercentage } from 'utils/drivers'
import {
  DriverSummaryContainer,
  DriverSummaryTitle,
  DriverSummaryTable,
  DriverSummaryHead,
  DriverSummaryHeader,
  DriverSummaryBody,
  DriverSummaryRow,
  DriverNameCell,
  TotalTimeCell,
  RacePercentageCell,
  MinimumRequirementWarning,
  DriverSummaryRowBelowMinimum,
  MinimumRequirementInfoIcon,
  MinimumRequirementTooltip,
  MinimumRequirementIconWrapper,
  MinimumRequirementList
} from './StintSchedule.styles'

interface DriverSummaryProps {
  stints: Stint[]
  drivers: string[]
  fuelTankCapacity: number
}

// Driving time per driver and its share of the race, flagged below the minimum.
export function DriverSummary({ stints, drivers, fuelTankCapacity }: DriverSummaryProps) {
  const { t } = useTranslation('raceDetails')

  const totalRaceTime = scheduleLength(stints, fuelTankCapacity)
  const minimumPercentage = minimumDriverPercentage(drivers.length)
  const rows = driverTotals(stints).map(([driver, totalMinutes]) => {
    const percentage = totalRaceTime > 0 ? (totalMinutes / totalRaceTime) * 100 : 0
    return { driver, totalMinutes, percentage, isBelowMinimum: percentage < minimumPercentage }
  })
  const hasViolation = rows.some(row => row.isBelowMinimum)

  return (
    <DriverSummaryContainer>
      <DriverSummaryTitle>
        {t('driverTotalTime')}
        <MinimumRequirementIconWrapper>
          <MinimumRequirementInfoIcon title={t('minimumRequirementTooltip')}>?</MinimumRequirementInfoIcon>
          <MinimumRequirementTooltip>
            <MinimumRequirementList>
              <li>{t('minimumRequirement2Drivers')}: 25%</li>
              <li>{t('minimumRequirement3Drivers')}: 16.7%</li>
              <li>{t('minimumRequirement4Drivers')}: 12.5%</li>
              <li>{t('minimumRequirement5Drivers')}: 10%</li>
              <li>{t('minimumRequirement6Drivers')}: 8.3%</li>
            </MinimumRequirementList>
          </MinimumRequirementTooltip>
        </MinimumRequirementIconWrapper>
      </DriverSummaryTitle>
      <DriverSummaryTable>
        <DriverSummaryHead>
          <tr>
            <DriverSummaryHeader>{t('driver')}</DriverSummaryHeader>
            <DriverSummaryHeader>{t('totalTime')}</DriverSummaryHeader>
            <DriverSummaryHeader>{t('raceTimePercentage')}</DriverSummaryHeader>
          </tr>
        </DriverSummaryHead>
        <DriverSummaryBody>
          {rows.map(({ driver, totalMinutes, percentage, isBelowMinimum }) => (
            <DriverSummaryRow
              key={driver}
              as={isBelowMinimum ? DriverSummaryRowBelowMinimum : DriverSummaryRow}
            >
              <DriverNameCell>{driver}</DriverNameCell>
              <TotalTimeCell>{formatHoursMinutes(totalMinutes)}</TotalTimeCell>
              <RacePercentageCell>{percentage.toFixed(1)}%</RacePercentageCell>
            </DriverSummaryRow>
          ))}
          {hasViolation && (
            <tr>
              <td colSpan={4} style={{ padding: 0, border: 'none' }}>
                <MinimumRequirementWarning>
                  {t('minimumRequirementWarning')}
                </MinimumRequirementWarning>
              </td>
            </tr>
          )}
        </DriverSummaryBody>
      </DriverSummaryTable>
    </DriverSummaryContainer>
  )
}
