import { createContext, useContext } from 'react'
import { type Socket } from 'socket.io-client'
import { type Race } from 'types/Race'
import { type Training } from 'api/TrainingApi'
import { type Qualification } from 'api/QualificationApi'

// Server -> client events and their payloads (see docs/API.md).
export interface SocketEvents {
  'race:updated': Race
  'stint:refresh': { raceId: string }
  'training:updated': Training
  'qualification:updated': Qualification
}

export type Unsubscribe = () => void

export interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  // Subscribe to one race's events (server room); returns the leave function.
  joinRace: (raceId: string) => Unsubscribe
  onRaceUpdated: (callback: (race: Race) => void) => Unsubscribe
  onStintRefresh: (callback: (data: { raceId: string }) => void) => Unsubscribe
  onTrainingUpdated: (callback: (training: Training) => void) => Unsubscribe
  onQualificationUpdated: (callback: (qualification: Qualification) => void) => Unsubscribe
}

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinRace: () => () => {},
  onRaceUpdated: () => () => {},
  onStintRefresh: () => () => {},
  onTrainingUpdated: () => () => {},
  onQualificationUpdated: () => () => {}
})

export function useSocket() {
  return useContext(SocketContext)
}
