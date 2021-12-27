import sdk from './1-initialize-sdk.js'
import * as Contracts from '../src/contracts.js'

const appModule = sdk.getAppModule(Contracts.APP_ADDRESS)

// deploy the vote module
;(async () => {
  try {
    const voteModule = await appModule.deployVoteModule({
      name: '<✊🏿,💻> Governance Proposals', // contract name
      votingTokenAddress: Contracts.TOKEN_ADDRESS, // ERC-20 token contract address
      proposalStartWaitTimeInSeconds: 0, // wait 0 seconds before starting voting
      proposalVotingTimeInSeconds: 24 * 60 * 60, // (24h) seconds members have to vote on a proposal when it's created
      votingQuorumFraction: 33, // 33% of members have to vote on a proposal to pass it
      minimumNumberOfTokensNeededToPropose: '1', //
    })
    console.log('voteModule:', voteModule)
    console.log(
      '✅ Successfully deployed vote module, address:',
      voteModule.address,
    )
  } catch (err) {
    console.log('❌ Failed to deploy vote module', err)
  }
})()
