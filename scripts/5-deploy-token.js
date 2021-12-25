import sdk from './1-initialize-sdk.js'

// app address to deploy
const app = sdk.getAppModule('0xF57ac6dADe3b7C406b309FF29B5A5e2B3cEcB8ad')

;(async () => {
  try {
    // Deploy a standard ERC-20 contract.
    const tokenModule = await app.deployTokenModule({
      name: 'AfroBuilderDAO Governance Token',
      symbol: 'AFB',
    })
    console.log(
      '✅ Successfully deployed token module, address:',
      tokenModule.address,
    )
  } catch (e) {
    console.error('failed to deploy token module', e)
  }
})()
