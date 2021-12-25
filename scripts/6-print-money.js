import {ethers} from 'ethers'
import sdk from './1-initialize-sdk.js'

const tokenModule = sdk.getTokenModule(
  '0xbC1b9B1Fd398753B46e5F29EF22707eE3Dc0Ca98',
)

;(async () => {
  try {
    const amount = 100_000

    // use the util function from "ethers" to convert the amount to have 18 decimals (which is the standard for ERC20 tokens).
    const amountWith18Decimals = ethers.utils.parseUnits(amount.toString(), 18)
    console.log('amountWith18Decimals:', amountWith18Decimals)

    // Interact with your deployed ERC-20 contract and mint the tokens!
    await tokenModule.mint(amountWith18Decimals)
    const totalSupply = await tokenModule.totalSupply()

    // Print out how many of our token's are out there now!
    console.log(
      '✅ There now is',
      ethers.utils.formatUnits(totalSupply, 18),
      '$AFB in circulation',
    )
  } catch (e) {
    console.error('Failed to print money', e)
  }
})()
