import * as React from 'react'
import {useWeb3} from '@3rdweb/hooks'

export const LandingContainer: React.FC = ({children}) => (
  <div className="landing">{children}</div>
)
const Welcome: React.FC = () => <h2>Welcome to the AfroBuildersDAO</h2>

export const App = () => {
  const {connectWallet, address, error, provider} = useWeb3()

  if (!address) {
    return (
      <LandingContainer>
        <Welcome />
        <button onClick={() => connectWallet('injected')}>
          Connect your Wallet
        </button>
      </LandingContainer>
    )
  }

  return (
    <LandingContainer>
      <Welcome />
      👀 wallet connected, now what!
    </LandingContainer>
  )
}
