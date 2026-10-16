import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { formatHoursMinutes } from 'utils/time'
import { driverColor, driverTotals, minimumDriverPercentage } from 'utils/drivers'
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
  MinimumRequirementList,
  DriverSwatch
} from './StintSchedule.styles'

interface DriverSummaryProps {
  // Stints as driven: the finishing one cut at the flag, those after it left out.
  stints: { driver: string; duration: number }[]
  drivers: string[]
  // Race time the shares are counted from, pit stops included.
  totalRaceTime: number
  // The race strip, shown above the table in the same colors.
  strip: ReactNode
}

// Race overview: the strip of stints, then driving time per driver and its share of the
// race, flagged below the minimum.
export function DriverSummary({ stints, drivers, totalRaceTime, strip }: DriverSummaryProps) {
  const { t } = useTranslation('raceDetails')

  const minimumPercentage = minimumDriverPercentage(drivers.length)
  const rows = driverTotals(stints).map(([driver, totalMinutes]) => {
    const percentage = totalRaceTime > 0 ? (totalMinutes / totalRaceTime) * 100 : 0
    return { driver, totalMinutes, percentage, isBelowMinimum: percentage < minimumPercentage }
  })
  const hasViolation = rows.some(row => row.isBelowMinimum)

  return (
    <DriverSummaryContainer>
      <DriverSummaryTitle>
        {t('raceOverview')}
        <MinimumRequirementIconWrapper>
          <MinimumRequirementInfoIcon type="button" aria-label={t('minimumRequirementTooltip')}>?</MinimumRequirementInfoIcon>
          <MinimumRequirementTooltip role="tooltip">
            <p>{t('minimumRequirementTooltip')}</p>
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
      {strip}
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
              as={isBelowMinimum ? DriverSummaryRowBelowMinimum : undefined}
            >
              <DriverNameCell>
                <DriverSwatch $bg={driverColor(drivers, driver)} />
                {driver}
              </DriverNameCell>
              <TotalTimeCell>{formatHoursMinutes(totalMinutes)}</TotalTimeCell>
              <RacePercentageCell>{percentage.toFixed(1)}%</RacePercentageCell>
            </DriverSummaryRow>
          ))}
        </DriverSummaryBody>
      </DriverSummaryTable>
      {hasViolation && (
        <MinimumRequirementWarning role="status">
          {t('minimumRequirementWarning')}
        </MinimumRequirementWarning>
      )}
    </DriverSummaryContainer>
  )
}
