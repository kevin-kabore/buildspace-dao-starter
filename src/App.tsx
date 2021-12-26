import * as React from 'react'
import {useWeb3} from '@3rdweb/hooks'
import {ThirdwebSDK} from '@3rdweb/sdk'
import {ethers} from 'ethers'
import {TOKEN_ADDRESS, BUNDLE_DROP_ADDRESS} from './contracts.js'
import {LandingContainer, WelcomeContainer} from './components'
// instatiate the ThirdwebSDK on Rinkeby.
const sdk = new ThirdwebSDK('rinkeby')
// grab a reference to the ERC-1155 contract.
const bundleDropModule = sdk.getBundleDropModule(BUNDLE_DROP_ADDRESS)
// get the token module
const tokenModule = sdk.getTokenModule(TOKEN_ADDRESS)

const shortenAddress = (str: string) =>
  str.substring(0, 6) + '...' + str.substring(str.length - 4)

export const App = () => {
  const {connectWallet, address, provider} = useWeb3()
  // State variable for us to know if user has our NFT.
  const [isNFTClaimed, setIsNFTClaimed] = React.useState(false)
  // State to keep a loading state while the NFT is minting.
  const [isMinting, setIsMinting] = React.useState(false)
  const [membershipNftAddress, setMembershipNftAddress] = React.useState('')
  // tokens each member has
  const [memberTokenAmounts, setMemberTokenAmounts] = React.useState<
    Record<string, any>
  >({})
  const [memberAddresses, setMemberAddresses] = React.useState<string[]>([])

  // gets all the addresses of members who hold an NFT from our ERC-1155 contract.
  React.useEffect(() => {
    if (!isNFTClaimed) return

    bundleDropModule.getAllClaimerAddresses('0').then(
      addresses => {
        console.log('🚀 Members addresses', addresses)
        setMemberAddresses(addresses)
      },
      err => {
        console.error('failed to get member list', err)
      },
    )
  }, [isNFTClaimed])

  // gets the token balances of everyone who hold’s our token on our ERC-20 contract.
  React.useEffect(() => {
    if (!isNFTClaimed) return

    tokenModule.getAllHolderBalances().then(
      amounts => {
        console.log('👜 Amounts', amounts)
        setMemberTokenAmounts(amounts)
      },
      err => {
        console.error('failed to get token amounts', err)
      },
    )
  }, [isNFTClaimed])

  // combines the memberAddresses and memberTokenAmounts into a single array
  const memberList = React.useMemo(
    () =>
      memberAddresses.map(address => {
        return {
          address,
          tokenAmount: ethers.utils.formatUnits(
            memberTokenAmounts[address] || '0',
            18,
          ),
        }
      }),
    [memberAddresses, memberTokenAmounts],
  )

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
          // nft claimed if balance > 0
          if (balance.gt(0)) {
            setIsNFTClaimed(true)
            setMembershipNftAddress(bundleDropModule.address)
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
        <WelcomeContainer isMember={Boolean(address && membershipNftAddress)} />
        <button onClick={() => connectWallet('injected')} className="btn-hero">
          Connect your Wallet
        </button>
      </LandingContainer>
    )
  }

  if (isNFTClaimed) {
    return (
      <LandingContainer>
        <div className="member-page">
          <WelcomeContainer
            isMember={Boolean(address && membershipNftAddress)}
          />
          <div>
            <div>
              <h2>Member List</h2>
              <table className="card">
                <thead>
                  <tr>
                    <th>Address</th>
                    <th>Token Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {memberList.map(member => {
                    return (
                      <tr key={member.address}>
                        <td>{shortenAddress(member.address)}</td>
                        <td>{member.tokenAmount}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
      <div className="mint-nft">
        <h1>Mint your free 🍪DAO Membership NFT</h1>
        <button disabled={isMinting} onClick={() => mintNft()}>
          {isMinting ? 'Minting...' : 'Mint your nft (FREE)'}
        </button>
      </div>
    </LandingContainer>
  )
}
