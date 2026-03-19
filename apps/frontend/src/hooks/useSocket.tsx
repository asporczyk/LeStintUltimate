import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import { io, type Socket } from 'socket.io-client'
import { type Race } from 'types/Race'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  onRaceUpdated: (callback: (race: Race) => void) => () => void
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onRaceUpdated: () => () => {}
})

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const listenersRef = useRef<Set<(race: Race) => void>>(new Set())

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

  return (
    <SocketContext.Provider value={{ socket, isConnected, onRaceUpdated }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
