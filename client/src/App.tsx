import { useEffect } from 'react';
import { setupApi } from './api';

function App() {
  useEffect(() => {
    setupApi();
  }, [])
  return (
    <div className="App">
      Planning Poker
    </div>
  );
}

export default App;
