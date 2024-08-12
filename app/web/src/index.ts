import './main'
import './init'
import './style.css'
import App from './components/App'

const root = document.getElementById('root')
if (root) root.innerHTML = App()


// export const eel = window.eel
// eel.set_host( 'ws://localhost:8080' )