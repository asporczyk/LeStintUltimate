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
  // Races this client follows, with a count so two components can join the same race.
  const joinedRacesRef = useRef(new Map<string, number>())
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const socketUrl = apiUrl.replace(/\/api$/, '')
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      // Rooms are per connection, so join them again after a reconnect.
      joinedRacesRef.current.forEach((_, raceId) => newSocket.emit('race:join', raceId))
    })
    newSocket.on('disconnect', () => setIsConnected(false))

    for (const event of EVENTS) {
      newSocket.on(event, (payload: SocketEvents[typeof event]) => {
        listenersRef.current.get(event)?.forEach(callback => callback(payload))
      })
    }

    socketRef.current = newSocket
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the socket is created once on mount and exposed via context
    setSocket(newSocket)

    return () => {
      socketRef.current = null
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

  const joinRace = useCallback((raceId: string): Unsubscribe => {
    const joined = joinedRacesRef.current
    joined.set(raceId, (joined.get(raceId) ?? 0) + 1)
    if (joined.get(raceId) === 1) socketRef.current?.emit('race:join', raceId)

    return () => {
      const count = (joined.get(raceId) ?? 1) - 1
      if (count > 0) {
        joined.set(raceId, count)
        return
      }
      joined.delete(raceId)
      socketRef.current?.emit('race:leave', raceId)
    }
  }, [])

  const value = useMemo(() => ({
    socket,
    isConnected,
    joinRace,
    onRaceUpdated: (callback: Listener<'race:updated'>) => subscribe('race:updated', callback),
    onStintRefresh: (callback: Listener<'stint:refresh'>) => subscribe('stint:refresh', callback),
    onTrainingUpdated: (callback: Listener<'training:updated'>) => subscribe('training:updated', callback),
    onQualificationUpdated: (callback: Listener<'qualification:updated'>) => subscribe('qualification:updated', callback),
  }), [socket, isConnected, joinRace, subscribe])

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
