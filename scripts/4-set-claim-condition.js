import sdk from './1-initialize-sdk.js'
import {BUNDLE_DROP_ADDRESS} from '../src/contracts'
const bundleDrop = sdk.getBundleDropModule(
  BUNDLE_DROP_ADDRESS, // module contract address
)

;(async () => {
  try {
    const claimConditionFactory = bundleDrop.getClaimConditionFactory()
    // Specify conditions.
    claimConditionFactory.newClaimPhase({
      startTime: new Date(),
      maxQuantity: 10_00,
      maxQuantityPerTransaction: 1,
    })
    await bundleDrop.setClaimCondition(0, claimConditionFactory)
    console.log('✅ Sucessfully set claim condition!')
  } catch (error) {
    console.error('❌ Failed to set claim condition', error)
  }
})()
