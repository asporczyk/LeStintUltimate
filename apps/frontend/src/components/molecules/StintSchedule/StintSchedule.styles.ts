import styled from 'styled-components'

export const ScheduleContainer = styled.div`
  width: 100%;
  margin-top: 2rem;
`

export const ScheduleTitle = styled.h2`
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 1.5rem;
  font-weight: 400;
  color: #fff;
  margin-bottom: 1rem;
`

export const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
`

export const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: rgba(255, 255, 255, 0.03);
  min-width: 700px;
  max-width: 100%;
`

export const TableHead = styled.thead`
  background: rgba(255, 255, 255, 0.08);
`

export const TableHeader = styled.th`
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`

export const TableBody = styled.tbody``

export const TableRow = styled.tr<{ $isActive?: boolean }>`
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
  ${({ $isActive }) => $isActive && `
    background: rgba(76, 175, 80, 0.15);
    &:hover {
      background: rgba(76, 175, 80, 0.2);
    }
  `}
`

export const TableCell = styled.td`
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 0.9rem;
  color: #fff;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  white-space: nowrap;
`

export const StintNumberCell = styled(TableCell)`
  color: rgba(255, 255, 255, 0.5);
  width: 50px;
`

export const DriverCell = styled(TableCell)`
  font-weight: 500;
`

export const ActiveIndicator = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  background: #4CAF50;
  border-radius: 50%;
  margin-left: 0.5rem;
`

export const ActionsCell = styled.td`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`

export const ActionButtonsWrapper = styled.div`
  display: flex;
  gap: 0.25rem;
`

export const TableRowWrapper = styled.div`
  position: relative;
  &:hover ${ActionButtonsWrapper} {
    opacity: 1;
  }
`

export const AddButtonWrapper = styled.div<{ $visible: boolean }>`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 36px;
  height: 100%;
  opacity: 0;
  transition: opacity 0.2s;
  cursor: pointer;
  &:hover {
    opacity: 1;
  }
  ${({ $visible }) => $visible && `
    opacity: 1;
  `}
`

export const RowSeparator = styled.div<{ $visible?: boolean }>`
  height: 24px;
  cursor: pointer;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $visible }) => $visible ? 'rgba(255, 29, 68, 0.15)' : 'transparent'};
  border-top: 1px dashed ${({ $visible }) => $visible ? '#FF1D44' : 'rgba(255, 255, 255, 0.1)'};
  border-bottom: 1px dashed ${({ $visible }) => $visible ? '#FF1D44' : 'rgba(255, 255, 255, 0.1)'};
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 29, 68, 0.15);
    border-color: #FF1D44;
  }
`

export const AddIcon = styled.div<{ $visible?: boolean }>`
  opacity: 0;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #FF1D44;
  
  svg {
    width: 12px;
    height: 12px;
    stroke: white;
    stroke-width: 3;
  }

  @media (max-width: 600px) {
    opacity: 1;
  }

  ${({ $visible }) => $visible && `
    opacity: 1;
  `}

  ${RowSeparator}:hover & {
    opacity: 1;
  }
`

export const AddButton = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #FF1D44;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.2s;

  &:hover {
    background: #ff3366;
    transform: scale(1.1);
  }

  svg {
    width: 14px;
    height: 14px;
    stroke: white;
  }
`

export const HoverZonesWrapper = styled.div`
  position: absolute;
  left: 0;
  right: 40px;
  top: 0;
  bottom: 0;
  z-index: 6;
`

export const TableRowContainer = styled.div`
  display: flex;
  align-items: stretch;
  position: relative;
`

export const StintRow = styled.div`
  display: contents;
`

export const RowCell = styled.div<{ $width?: string }>`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  white-space: nowrap;
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 0.9rem;
  color: #fff;
  width: ${({ $width }) => $width || 'auto'};
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.03);
`

export const RowHeader = styled(RowCell)`
  background: rgba(255, 255, 255, 0.08);
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`

export const RowDriver = styled(RowCell)`
  font-weight: 500;
`

export const ActiveRow = styled.div`
  background: rgba(76, 175, 80, 0.15);
  border-radius: 4px;
  &:hover {
    background: rgba(76, 175, 80, 0.2);
  }
`

export const InactiveRow = styled.div`
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }
`

export const NotesContainer = styled.div`
  width: 100%;
  margin-top: 1rem;
`

export const NotesLabel = styled.label`
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  display: block;
  margin-bottom: 0.5rem;
`

export const NotesTextarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 0.9rem;
  resize: vertical;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  &:focus {
    outline: none;
    border-color: #FF1D44;
  }
`

export const CharCount = styled.span<{ $isOver: boolean }>`
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 0.75rem;
  color: ${({ $isOver }) => $isOver ? '#ff4444' : 'rgba(255, 255, 255, 0.5)'};
  display: block;
  text-align: right;
  margin-top: 0.25rem;
`

export const NotesFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.25rem;
`

export const SaveNotesButton = styled.button`
  padding: 0.4rem 0.8rem;
  background: #FF1D44;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: #E0153C;
  }
`

export const DriverSummaryContainer = styled.div`
  width: 100%;
  margin-top: 1.5rem;
  margin-bottom: 2rem;
`

export const DriverSummaryTitle = styled.h3`
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 1rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.75rem;
`

export const DriverSummaryTable = styled.table`
  width: 100%;
  max-width: 400px;
  border-collapse: separate;
  border-spacing: 0;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  overflow: hidden;
`

export const DriverSummaryHead = styled.thead`
  background: rgba(255, 255, 255, 0.08);
`

export const DriverSummaryHeader = styled.th`
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`

export const DriverSummaryBody = styled.tbody``

export const DriverSummaryRow = styled.tr`
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`

export const DriverSummaryCell = styled.td`
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 0.9rem;
  color: #fff;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`

export const DriverNameCell = styled(DriverSummaryCell)`
  font-weight: 500;
`

export const TotalTimeCell = styled(DriverSummaryCell)`
  color: rgba(255, 255, 255, 0.8);
`
