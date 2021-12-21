import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {ThirdwebWeb3Provider} from '@3rdweb/hooks'

import './index.css'

import {App} from './App'

// include chains we want to support
const supportedChainIds = [4] // rinkeby

// types of wallets we want to support, metamask is an injecte wallet
const connectors = {
  injected: {},
}

// Render the App component to the DOM
ReactDOM.render(
  <React.StrictMode>
    <ThirdwebWeb3Provider
      connectors={connectors}
      supportedChainIds={supportedChainIds}
    >
      <App />
    </ThirdwebWeb3Provider>
  </React.StrictMode>,
  document.getElementById('root'),
)
