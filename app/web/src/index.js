import './main'
import './init'
import './style.css'
import App from './components/app'

const root = document.getElementById('root')
root.innerHTML = App()


// export const eel = window.eel
// eel.set_host( 'ws://localhost:8080' )