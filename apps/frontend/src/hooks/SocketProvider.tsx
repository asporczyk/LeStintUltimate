import { useEffect, useState, useCallback, useMemo, useRef, type ReactNode } from 'react'
import { io, type Socket } from 'socket.io-client'
import { SocketContext, type SocketEvents, type Unsubscribe } from '@/hooks/useSocket'

type EventName = keyof SocketEvents
type Listener<E extends EventName> = (payload: SocketEvents[E]) => void

const EVENTS: EventName[] = ['race:updated', 'stint:refresh', 'training:updated', 'qualification:updated']

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const listenersRef = useRef(new Map<EventName, Set<Listener<EventName>>>(EVENTS.map(event => [event, new Set()])))

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const socketUrl = apiUrl.replace(/\/api$/, '')
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => setIsConnected(true))
    newSocket.on('disconnect', () => setIsConnected(false))

    for (const event of EVENTS) {
      newSocket.on(event, (payload: SocketEvents[typeof event]) => {
        listenersRef.current.get(event)?.forEach(callback => callback(payload))
      })
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- the socket is created once on mount and exposed via context
    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  const subscribe = useCallback(<E extends EventName>(event: E, callback: Listener<E>): Unsubscribe => {
    const listeners = listenersRef.current.get(event) as Set<Listener<E>>
    listeners.add(callback)
    return () => {
      listeners.delete(callback)
    }
  }, [])

  const value = useMemo(() => ({
    socket,
    isConnected,
    onRaceUpdated: (callback: Listener<'race:updated'>) => subscribe('race:updated', callback),
    onStintRefresh: (callback: Listener<'stint:refresh'>) => subscribe('stint:refresh', callback),
    onTrainingUpdated: (callback: Listener<'training:updated'>) => subscribe('training:updated', callback),
    onQualificationUpdated: (callback: Listener<'qualification:updated'>) => subscribe('qualification:updated', callback),
  }), [socket, isConnected, subscribe])

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
