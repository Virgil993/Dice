import { useState, React } from 'react'
import './styles/App.css'
import Home from './views/Home'
import 'bootstrap/dist/css/bootstrap.min.css';
import {} from "reactstrap"
import Register from './views/Register';
import Login from './views/Login';

function App() {

  return (
      <div className='app'>
        <Login/>
      </div>
  )
}

export default App
