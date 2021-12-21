import * as React from 'react'
import {useWeb3} from '@3rdweb/hooks'
import {ThirdwebSDK} from '@3rdweb/sdk'

// instatiate the ThirdwebSDK on Rinkeby.
const sdk = new ThirdwebSDK('rinkeby')
// grab a reference to the ERC-1155 contract.
const bundleDropModule = sdk.getBundleDropModule(
  '0xE0d9D544DC499f62519dA2614D3A842782Ed1FCf',
)
export const LandingContainer: React.FC = ({children}) => (
  <div className="landing">{children}</div>
)
const Welcome: React.FC = () => <h2>Welcome to the AfroBuildersDAO</h2>

export const App = () => {
  const {connectWallet, address, error, provider} = useWeb3()
  // State variable for us to know if user has our NFT.
  const [isNFTClaimed, setIsNFTClaimed] = React.useState(false)

  React.useEffect(() => {
    if (!address) {
      return
    }
    // Check if the user has the NFT by using bundleDropModule.balanceOf
    const getIsNFTClaimed = async () => {
      await bundleDropModule.balanceOf(address, [0]).then(
        balance => {
          // nft claimed if balance > 0
          if (balance.gt(0)) {
            setIsNFTClaimed(true)
            console.log('🌟 this user has a membership NFT!')
          } else {
            setIsNFTClaimed(false)
            console.log("😭 this user doesn't have a membership NFT.")
          }
        },
        error => {
          console.error('error getting nft balance', error)
        },
      )
    }
    getIsNFTClaimed()
  }, [address])

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
      {isNFTClaimed ? (
        <p>👀 user has a membership nft, now what!</p>
      ) : (
        <p>Claim nft!</p>
      )}
    </LandingContainer>
  )
}
