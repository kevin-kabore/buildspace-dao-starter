import sdk from './1-initialize-sdk.js'
import {THIRD_WEB_APP_ADDRESS} from '../src/contracts.js'
// app address to deploy
const app = sdk.getAppModule(THIRD_WEB_APP_ADDRESS)

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
