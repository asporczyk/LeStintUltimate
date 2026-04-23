import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import { io, type Socket } from 'socket.io-client'
import { type Race } from 'types/Race'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  onRaceUpdated: (callback: (race: Race) => void) => () => void
  onStintRefresh: (callback: (data: { raceId: string }) => void) => () => void
  onTrainingUpdated: (callback: (training: any) => void) => () => void
  onQualificationUpdated: (callback: (qualification: any) => void) => () => void
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onRaceUpdated: () => () => {},
  onStintRefresh: () => () => {},
  onTrainingUpdated: () => () => {},
  onQualificationUpdated: () => () => {}
})

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const listenersRef = useRef<Set<(race: Race) => void>>(new Set())
  const stintRefreshListenersRef = useRef<Set<(data: { raceId: string }) => void>>(new Set())
  const trainingUpdatedListenersRef = useRef<Set<(training: any) => void>>(new Set())
  const qualificationUpdatedListenersRef = useRef<Set<(qualification: any) => void>>(new Set())

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const socketUrl = apiUrl.replace(/\/api$/, '')
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
    })

    newSocket.on('race:updated', (race: Race) => {
      listenersRef.current.forEach(callback => callback(race))
    })

    newSocket.on('stint:refresh', (data: { raceId: string }) => {
      stintRefreshListenersRef.current.forEach(callback => callback(data))
    })

    newSocket.on('training:updated', (training: any) => {
      trainingUpdatedListenersRef.current.forEach(callback => callback(training))
    })

    newSocket.on('qualification:updated', (qualification: any) => {
      qualificationUpdatedListenersRef.current.forEach(callback => callback(qualification))
    })

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  const onRaceUpdated = useCallback((callback: (race: Race) => void) => {
    listenersRef.current.add(callback)

    return () => {
      listenersRef.current.delete(callback)
    }
  }, [])

  const onStintRefresh = useCallback((callback: (data: { raceId: string }) => void) => {
    stintRefreshListenersRef.current.add(callback)

    return () => {
      stintRefreshListenersRef.current.delete(callback)
    }
  }, [])

  const onTrainingUpdated = useCallback((callback: (training: any) => void) => {
    trainingUpdatedListenersRef.current.add(callback)

    return () => {
      trainingUpdatedListenersRef.current.delete(callback)
    }
  }, [])

  const onQualificationUpdated = useCallback((callback: (qualification: any) => void) => {
    qualificationUpdatedListenersRef.current.add(callback)

    return () => {
      qualificationUpdatedListenersRef.current.delete(callback)
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket, isConnected, onRaceUpdated, onStintRefresh, onTrainingUpdated, onQualificationUpdated }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
