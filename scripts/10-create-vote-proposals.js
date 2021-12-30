import {ethers} from 'ethers'
import sdk from './1-initialize-sdk.js'
import {VOTE_ADDRESS, TOKEN_ADDRESS} from '../src/contracts.js'

const voteModule = sdk.getVoteModule(VOTE_ADDRESS)
const tokenModule = sdk.getTokenModule(TOKEN_ADDRESS)

;(async () => {
  let amount
  let proposal
  // create a proposal to mint 10,000 tokens to the treasury
  try {
    await tokenModule.delegateTo(process.env.WALLET_ADDRESS)
    amount = 10_000
    proposal = `Should the DAO mint an additional ${amount} into the treasury?`
    await voteModule.propose(proposal, [
      {
        nativeTokenValue: 0, // Our nativeToken is ETH. nativeTokenValue is the amount of ETH we want
        transactionData: tokenModule.contract.interface.encodeFunctionData(
          'mint', // we're doing a mint operation
          [
            voteModule.address, // minting to the voteModule, which is acting as our treasury
            ethers.utils.parseUnits(amount.toString(), 18),
          ],
        ),
        toAddress: tokenModule.address, // token module that actually executes the mint.
      },
    ])
    console.log('✅ Successfully created proposal to mint tokens')
  } catch (err) {
    console.error('❌ failed to create first proposal', err)
    process.exit(1)
  }

  // create a proposal to send 1_000 tokens to the OG dev address for creating the
  try {
    amount = 1_000
    proposal = `Should the DAO transfer ${amount} tokens from the treasury to
    ${process.env.WALLET_ADDRESS} for being awesome?`
    await voteModule.propose(proposal, [
      {
        nativeTokenValue: 0,
        transactionData: tokenModule.contract.interface.encodeFunctionData(
          // We're doing a transfer from the treasury to our wallet.
          'transfer',
          [
            process.env.WALLET_ADDRESS,
            ethers.utils.parseUnits(amount.toString(), 18),
          ],
        ),

        toAddress: tokenModule.address,
      },
    ])

    console.log(
      "✅ Successfully created proposal to reward ourselves from the treasury, let's hope people vote for it!",
    )
  } catch (err) {
    console.error('❌ failed to create second proposal', err)
  }
})()
