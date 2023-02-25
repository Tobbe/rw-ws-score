import { useCallback, useContext, useEffect, useRef, useState } from 'react'

interface WsContextProps {
  players: Record<string, number>
  setScore: (playerId: string, score: number) => void
}

const WsContext = React.createContext<WsContextProps | undefined>(undefined)

interface Props {
  children: React.ReactNode
}

const WsContextProvider: React.FC<Props> = ({ children }) => {
  const [players, setPlayers] = useState<Record<string, number>>({})

  const ws = useRef<WebSocket>()

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8911/ws')

    socket.onopen = (event) => {
      console.log('socket open', event)
    }
    socket.onclose = (event) => {
      console.log('socket close', event)
    }
    socket.onerror = (event) => {
      console.log('socket error', event)
    }
    socket.onmessage = (event) => {
      console.log('onmessage', event.data)

      try {
        const players = JSON.parse(event.data)
        setPlayers(players)
      } catch (e) {
        console.error('JSON.parse error', e)
      }
    }

    ws.current = socket

    return () => {
      socket.close()
    }
  }, [])

  const setScore = useCallback((playerId: string, score: number) => {
    ws.current?.send(JSON.stringify({ playerId, score }))
  }, [])

  return (
    <WsContext.Provider value={{ players, setScore }}>
      {children}
    </WsContext.Provider>
  )
}

export function useWsContext() {
  const context = useContext(WsContext)

  if (!context) {
    throw new Error('useWsContext must be used within a WsContextProvider')
  }

  return context
}

export default WsContextProvider
