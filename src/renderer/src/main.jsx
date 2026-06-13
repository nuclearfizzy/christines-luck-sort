import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'

// This is where React takes over the empty <div id="root"> and draws the game.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
