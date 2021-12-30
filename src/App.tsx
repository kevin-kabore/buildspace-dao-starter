import * as React from 'react'
import {useWeb3} from '@3rdweb/hooks'
import {ThirdwebSDK} from '@3rdweb/sdk'
import {ethers} from 'ethers'
import {UnsupportedChainIdError} from '@web3-react/core'
import {TOKEN_ADDRESS, BUNDLE_DROP_ADDRESS, VOTE_ADDRESS} from './contracts'
import {LandingContainer, WelcomeContainer} from './components'
// instatiate the ThirdwebSDK on Rinkeby.
const sdk = new ThirdwebSDK('rinkeby')
// grab a reference to the ERC-1155 contract.
const bundleDropModule = sdk.getBundleDropModule(BUNDLE_DROP_ADDRESS)
// get the token module
const tokenModule = sdk.getTokenModule(TOKEN_ADDRESS)
// governance contract
const voteModule = sdk.getVoteModule(VOTE_ADDRESS)

const shortenAddress = (str: string) =>
  str.substring(0, 6) + '...' + str.substring(str.length - 4)

export const App = () => {
  const {connectWallet, address, provider, error} = useWeb3()
  const [isNFTClaimed, setIsNFTClaimed] = React.useState(false) // State variable for us to know if user has our NFT.
  const [isMinting, setIsMinting] = React.useState(false) // State to keep a loading state while the NFT is minting.
  const [membershipNftAddress, setMembershipNftAddress] = React.useState('')
  const [memberTokenAmounts, setMemberTokenAmounts] = React.useState<
    Record<string, any>
  >({}) // tokens each member has
  const [memberAddresses, setMemberAddresses] = React.useState<string[]>([])
  const [proposals, setProposals] = React.useState<any[]>([])
  const [isVoting, setIsVoting] = React.useState(false)
  const [hasVoted, setHasVoted] = React.useState(false)

  // gets all the addresses of members who hold an NFT from our ERC-1155 contract.
  React.useEffect(() => {
    if (!isNFTClaimed) return

    bundleDropModule.getAllClaimerAddresses('0').then(
      addresses => {
        console.log('🚀 Members addresses', addresses)
        setMemberAddresses(addresses)
      },
      err => {
        console.error('❌ Failed to get member list', err)
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
        console.error('❌ Failed to get token amounts', err)
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
      try {
        const balance = await bundleDropModule.balanceOf(address, [0])
        if (balance.gt(0)) {
          setIsNFTClaimed(true)
          setMembershipNftAddress(bundleDropModule.address)
        } else {
          setIsNFTClaimed(false)
          console.log("😭 this user doesn't have a membership NFT.")
        }
      } catch (error) {
        console.error('error getting nft balance', error)
      }
    }

    getIsNFTClaimed()
  }, [address])

  // get/set proposals if nft is claimed
  React.useEffect(() => {
    if (!isNFTClaimed) return

    const getProposals = async () => {
      try {
        const proposals = await voteModule.getAll()
        setProposals(proposals)
        console.log('🌈 Proposals:', proposals)
      } catch (err) {
        console.error('failed to get proposals', err)
      }
    }

    getProposals()
  }, [isNFTClaimed])

  // check if user has voted
  React.useEffect(() => {
    if (!isNFTClaimed) return

    if (!proposals.length) return // don't retrieve if we don't have any proposals
    const getHasVoted = async () => {
      try {
        const voted = await voteModule.hasVoted(
          proposals[0].proposalId,
          address,
        )
        setHasVoted(voted)
        if (voted) {
          console.log('🥵 User has already voted')
        }
      } catch (error) {
        console.error('failed to check if wallet has voted', error)
      }
    }
    getHasVoted()
  }, [isNFTClaimed, proposals, address])

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

  if (error instanceof UnsupportedChainIdError) {
    return (
      <div className="unsupported-network">
        <h2>Please connect to Rinkeby</h2>
        <p>
          This dapp only works on the Rinkeby network, please switch networks in
          your connected wallet.
        </p>
      </div>
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
              <h3>Member List</h3>
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
            <div>
              <h3>Active Proposals</h3>
              <form
                onSubmit={async e => {
                  e.preventDefault()
                  e.stopPropagation()

                  setIsVoting(true) // disable the button

                  const votes = proposals.map(proposal => {
                    let voteResult = {
                      proposalId: proposal.proposalId,
                      //abstain by default
                      vote: 2,
                    }
                    proposal.votes.forEach((vote: DaoVote) => {
                      const elem = document.getElementById(
                        proposal.proposalId + '-' + vote.type,
                      ) as HTMLInputElement

                      if (elem?.checked) {
                        voteResult.vote = vote.type
                      }
                    })
                    return voteResult
                  })

                  // make sure the user delegates their tokens to vote
                  try {
                    // check if the wallet still needs to delegate their tokens before they can vote
                    const delegation = await tokenModule.getDelegationOf(
                      address,
                    )
                    // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
                    if (delegation === ethers.constants.AddressZero) {
                      await tokenModule.delegateTo(address) // delegate before voting
                    }

                    // then we need to vote on the proposals
                    try {
                      await Promise.all(
                        votes.map(async vote => {
                          // before voting we first need to check whether the proposal is open for voting
                          // we first need to get the latest state of the proposal
                          const proposal = await voteModule.get(vote.proposalId)
                          // then we check if the proposal is open for voting (state === 1 means it is open)
                          if (proposal.state === 1) {
                            // if it is open for voting, we'll vote on it
                            return voteModule.vote(vote.proposalId, vote.vote)
                          }
                          // if the proposal is not open for voting we just return nothing, letting us continue
                          return
                        }),
                      )
                      try {
                        // if any of the propsals are ready to be executed we'll need to execute them
                        // a proposal is ready to be executed if it is in state 4
                        await Promise.all(
                          votes.map(async vote => {
                            // we'll first get the latest state of the proposal again, since we may have just voted before
                            const proposal = await voteModule.get(
                              vote.proposalId,
                            )

                            //if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
                            if (proposal.state === 4) {
                              return voteModule.execute(vote.proposalId)
                            }
                          }),
                        )
                        // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
                        setHasVoted(true)
                        // and log out a success message
                        console.log('successfully voted')
                      } catch (err) {
                        console.error('failed to execute votes', err)
                      }
                    } catch (err) {
                      console.error('failed to vote', err)
                    }
                  } catch (err) {
                    console.error('failed to delegate tokens')
                  } finally {
                    setIsVoting(false) // in *either* case we need to set the isVoting state to false to enable the button again
                  }
                }}
              >
                {proposals.map(proposal => (
                  <div key={proposal.proposalId} className="card">
                    <h5>{proposal.description}</h5>
                    <div>
                      {proposal.votes.map((vote: DaoVote) => (
                        <div key={vote.type}>
                          <input
                            type="radio"
                            id={proposal.proposalId + '-' + vote.type}
                            name={proposal.proposalId}
                            value={vote.type}
                            defaultChecked={vote.type === 2} //default the "abstain" vote to chedked
                          />
                          <label
                            htmlFor={proposal.proposalId + '-' + vote.type}
                          >
                            {vote.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <button disabled={isVoting || hasVoted} type="submit">
                  {isVoting
                    ? 'Voting...'
                    : hasVoted
                    ? 'You Already Voted'
                    : 'Submit Votes'}
                </button>
                <small>
                  This will trigger multiple transactions that you will need to
                  sign.
                </small>
              </form>
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

interface DaoVote {
  count: any
  label: 'Against' | 'For' | 'Abstain'
  type: number
}
