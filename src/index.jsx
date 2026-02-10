import {createRoot} from 'react-dom/client'
import App from './App.jsx'

// StrictMode disabled to prevent WebSocket connection issues during development
// StrictMode causes double-mounting which closes WebSocket connections prematurely
createRoot(document.getElementById('root')).render(
    <App/>
)
