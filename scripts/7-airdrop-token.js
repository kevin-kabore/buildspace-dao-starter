import {ethers} from 'ethers'
import sdk from './1-initialize-sdk.js'
import {BUNDLE_DROP_ADDRESS} from '../src/contracts.js'
// address of the ERC-1155 membership NFT contract
const bundleDropModule = sdk.getBundleDropModule(BUNDLE_DROP_ADDRESS)

// ERC-20 token contract address
const tokenModule = sdk.getTokenModule(
  '0xbC1b9B1Fd398753B46e5F29EF22707eE3Dc0Ca98',
)

;(async () => {
  try {
    // Grab all the addresses of people who own our membership NFT, which has
    // a tokenId of 0.
    const walletAddresses = await bundleDropModule.getAllClaimerAddresses('0')
    if (!walletAddresses.length) {
      console.log(
        'No NFTs have been claimed yet, maybe get some friends to claim your free NFTs!',
      )
      process.exit(0)
    }

    const airdropTargets = walletAddresses.map(address => {
      // Pick a random # between 1000 and 10000.
      const randomAmount = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000)
      console.log('✅ Going to airdrop', randomAmount, 'tokens to', address)

      // setup the target
      const airdropTarget = {
        address,
        amount: ethers.utils.parseUnits(randomAmount.toString(), 18), // we need 18 decimal placees!
      }
      return airdropTarget
    })
    // Call transferBatch on all our airdrop targets.
    console.log('🌈 Starting airdrop...')
    await tokenModule.transferBatch(airdropTargets)
    console.log(
      '✅ Successfully airdropped tokens to all the holders of the NFT!',
    )
  } catch (e) {
    console.error('❌ Failed to airdrop tokens', e)
  }
})()
