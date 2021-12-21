import sdk from './1-initialize-sdk.js'
import {readFileSync} from 'fs'

const bundleDrop = sdk.getBundleDropModule(
  '0xE0d9D544DC499f62519dA2614D3A842782Ed1FCf', // module contract address
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
