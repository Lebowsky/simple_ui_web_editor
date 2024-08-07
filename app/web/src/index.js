import './main'
import './init'
import './style.css'
import {getQRByteArrayAsBase64} from './export'

console.log(await getQRByteArrayAsBase64());
 

export const eel = window.eel
eel.set_host( 'ws://localhost:8080' )