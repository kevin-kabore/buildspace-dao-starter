import sdk from './1-initialize-sdk.js'
import {readFileSync} from 'fs'
import {BUNDLE_DROP_ADDRESS} from '../src/contracts.js'

const bundleDrop = sdk.getBundleDropModule(
  BUNDLE_DROP_ADDRESS, // module contract address
)

;(async () => {
  try {
    await bundleDrop.createBatch([
      {
        name: 'Software Sundays Logo',
        description:
          'This NFT of the original Software Sundays logo grants you access to the AfroBuilderDAO.',
        image: readFileSync('scripts/assets/software-sundays.png'),
      },
    ])
    console.log('✅ Successfully created a new NFT in the drop!')
  } catch (error) {
    console.error('failed to create the new NFT', error)
  }
})()
