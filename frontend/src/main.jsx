import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppMain } from './App'
import './styles/index.css'
import store from './redux/store'
import { Provider } from 'react-redux'

ReactDOM.createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <AppMain />
    </Provider>


)
