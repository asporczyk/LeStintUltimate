import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type Stint } from 'types/Schedule'
import { CheckIcon } from 'components/atoms/CheckIcon/CheckIcon'
import { IconButton } from 'components/atoms/IconButton/IconButton'
import {
  TableRow,
  StintNumberCell,
  DriverCell,
  TableCell,
  ActiveIndicator,
  ActionsCell,
  ActionButtonsWrapper,
  RowSeparator,
  AddIcon
} from './StintSchedule.styles'
import EditIcon from 'assets/svg/edit.svg'
import TrashIcon from 'assets/svg/trash.svg'

export const STINT_COLUMNS = 14

interface StintRowProps {
  stint: Stint
  number: number
  startClock: string
  endClock: string
  isActive: boolean
  remainingTires: number
  onEdit: () => void
  onDelete: () => void
  onInsertAfter: () => void
}

const TireCell = ({ value }: { value: string }) => (
  <TableCell>{value !== '-' ? <CheckIcon /> : value}</TableCell>
)

// One stint plus the hover separator below it for inserting the next stint.
export function StintRow({ stint, number, startClock, endClock, isActive, remainingTires, onEdit, onDelete, onInsertAfter }: StintRowProps) {
  const { t } = useTranslation('raceDetails')
  const [separatorHovered, setSeparatorHovered] = useState(false)

  return (
    <>
      <TableRow $isActive={isActive}>
        <StintNumberCell>{number}</StintNumberCell>
        <TableCell>{startClock}</TableCell>
        <TableCell>{stint.duration} min</TableCell>
        <TableCell>{endClock}</TableCell>
        <TableCell>{stint.fuelLaps}</TableCell>
        <DriverCell>
          {stint.driver}
          {isActive && <ActiveIndicator />}
        </DriverCell>
        <TableCell>{stint.spotter}</TableCell>
        <TableCell>{stint.fuel}%</TableCell>
        <TireCell value={stint.tireFL} />
        <TireCell value={stint.tireFR} />
        <TireCell value={stint.tireRL} />
        <TireCell value={stint.tireRR} />
        <TableCell>{remainingTires}</TableCell>
        <ActionsCell>
          <ActionButtonsWrapper>
            <IconButton onClick={onEdit} title={t('edit')} icon={EditIcon} />
            <IconButton onClick={onDelete} title={t('delete')} icon={TrashIcon} />
          </ActionButtonsWrapper>
        </ActionsCell>
      </TableRow>
      <TableRow>
        <td colSpan={STINT_COLUMNS} style={{ padding: 0, border: 'none' }}>
          <RowSeparator
            $visible={separatorHovered}
            onMouseEnter={() => setSeparatorHovered(true)}
            onMouseLeave={() => setSeparatorHovered(false)}
            onClick={onInsertAfter}
          >
            <AddIcon $visible={separatorHovered}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </AddIcon>
          </RowSeparator>
        </td>
      </TableRow>
    </>
  )
}
