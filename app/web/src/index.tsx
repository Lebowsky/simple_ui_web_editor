import { createRoot } from 'react-dom/client'
import './main'
import './init'
import './style.css'
import App from './components/App'

const root = document.getElementById('root')
if (!root) throw new Error('root not found')

const container = createRoot(root)

container.render(<App />)


// export const eel = window.eel
// eel.set_host( 'ws://localhost:8080' )