import { HashRouter } from 'react-router-dom'
import './App.css'
import { AppRoutes } from './routes/AppRoutes'
import { SocketSettingsProvider } from './providers/SocketSettingsProvider'

function App() {
  return (
    <SocketSettingsProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </SocketSettingsProvider>
  )
}

export default App
