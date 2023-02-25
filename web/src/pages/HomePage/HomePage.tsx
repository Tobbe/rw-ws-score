import { useState } from 'react'

import { useWsContext } from 'src/components/WsContext/WsContext'

const HomePage = () => {
  const [name, setName] = useState('')
  const [score, setScore] = useState('')
  const ws = useWsContext()

  return (
    <>
      <label>
        Name:{' '}
        <input
          value={name}
          onChange={(event) => {
            setName(event.target.value)
          }}
        />
      </label>
      <br />
      <br />
      <label>
        Score:{' '}
        <input
          value={score}
          onChange={(event) => {
            const score = event.target.value

            // Set the score in component state to make the input
            // value update immediately
            setScore(score)

            // Send to the server to update all clients (including
            // this one)
            ws.setScore(name, score)
          }}
        />
      </label>
      <hr />
      <ul>
        {Object.entries(ws.players).map(([playerId, playerScore]) => (
          <li key={playerId}>
            {playerId}: {playerScore}
          </li>
        ))}
      </ul>
    </>
  )
}

export default HomePage
