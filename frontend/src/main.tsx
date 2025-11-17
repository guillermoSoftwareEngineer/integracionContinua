import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter, Route } from 'react-router-dom'
import App from './App'
import { store } from './store'
import './index.css'
import Home from './pages/Home'
import Movements from './pages/Movements'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Route path='/' element={<App />}>
          <Route index element={<Home />} />
          <Route path="/movements" element={<Movements />} />
        </Route>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)
