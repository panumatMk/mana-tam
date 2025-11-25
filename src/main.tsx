import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.scss'
import { BrowserRouter } from 'react-router-dom' // เพิ่มบรรทัดนี้

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter> {/* ครอบด้วย BrowserRouter */}
            <App />
        </BrowserRouter>
    </React.StrictMode>,
)
