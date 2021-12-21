import sdk from './1-initialize-sdk.js'

const bundleDrop = sdk.getBundleDropModule(
  '0xE0d9D544DC499f62519dA2614D3A842782Ed1FCf', // module contract address
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
    console.error('Failed to set claim condition', error)
  }
})()
