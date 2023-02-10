import { useEffect } from 'react';
import { io } from 'socket.io-client'

function App() {
  useEffect(() => {
    const socket = io('http://172.16.5.4:4000')
    socket.on('connect', () => {
      console.log('Connected to server')
    })
  }, [])
  return (
    <div className="App">
      Planning Poker
    </div>
  );
}

export default App;
