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
  // State to keep a loading state while the NFT is minting.
  const [isMinting, setIsMinting] = React.useState(false)
  const [membershipNftAddress, setMembershipNftAddress] = React.useState('')

  // The signer is required to sign transactions on the blockchain.
  // Without it we can only read data, not write.
  const signer = provider ? provider.getSigner() : undefined

  React.useEffect(() => {
    if (!signer) return
    // We pass the signer to the sdk, which enables us to interact with our deployed contract
    sdk.setProviderOrSigner(signer)
  }, [signer])

  React.useEffect(() => {
    if (!address) {
      return
    }
    // Check if the user has the NFT by using bundleDropModule.balanceOf
    const getIsNFTClaimed = async () => {
      await bundleDropModule.balanceOf(address, [0]).then(
        balance => {
          console.log('balance:', balance)
          // nft claimed if balance > 0
          console.log('balance.gt(0):', balance.gt(0))
          if (balance.gt(0)) {
            setIsNFTClaimed(true)
            // TODO: get and set the membership NFT address
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

  const mintNft = () => {
    setIsMinting(true)
    bundleDropModule
      .claim('0', 1)
      .catch(error => {
        console.error('error claiming nft', error)
        setIsMinting(false)
      })
      .finally(() => {
        setIsMinting(false)
        setIsNFTClaimed(true)
        setMembershipNftAddress(bundleDropModule.address)
        console.log(
          `🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`,
        )
      })
  }

  return (
    <LandingContainer>
      <Welcome />
      {isNFTClaimed ? (
        <div>
          <p>
            Membership nft:{' '}
            <a
              href={`https://testnets.opensea.io/assets${membershipNftAddress}/0`}
            >
              View on Opensea
            </a>{' '}
          </p>
        </div>
      ) : (
        <div className="mint-nft">
          <h1>Mint your free 🍪DAO Membership NFT</h1>
          <button disabled={isMinting} onClick={() => mintNft()}>
            {isMinting ? 'Minting...' : 'Mint your nft (FREE)'}
          </button>
        </div>
      )}
    </LandingContainer>
  )
}
