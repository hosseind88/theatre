import ReactDOM from 'react-dom'
import './index.css'
import reportWebVitals from './reportWebVitals'
import studio from '@theatre/studio'
import {getProject} from '@theatre/core'

studio.initialize()

ReactDOM.render(
  <React.StrictMode>
    <App project={getProject('CRA project')} />
  </React.StrictMode>,
  document.getElementById('root'),
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
