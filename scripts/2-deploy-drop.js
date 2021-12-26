import {ethers} from 'ethers'
import sdk from './1-initialize-sdk.js'
import {readFileSync} from 'fs'
import {THIRD_WEB_APP_ADDRESS} from '../src/contracts.js'

const app = sdk.getAppModule(THIRD_WEB_APP_ADDRESS)
// address from initialize-sdk

;(async () => {
  try {
    // ERC-1155 collection (same) vs ERC-721 (unique)
    const bundleDropModule = await app.deployBundleDropModule({
      name: 'AfroBuildersDAO Membership',
      description:
        'A DAO of African and African Diaspora builders in software, data science and web3.',
      // The image for the collection that will show up on OpenSea.
      image: readFileSync('scripts/assets/software-sundays.png'),
      // We need to pass in the address of the person who will be receiving the proceeds from sales of nfts in the module.
      // We're planning on not charging people for the drop, so we'll pass in the 0x0 address
      // you can set this to your own wallet address if you want to charge for the drop.
      primarySaleRecipientAddress: ethers.constants.AddressZero,
    })
    console.log(
      '✅ Successfully deployed bundleDrop module, address:',
      bundleDropModule.address,
    )
    console.log('✅ bundleDrop metadata:', await bundleDropModule.getMetadata())
  } catch (error) {
    console.log('failed to deploy bundleDrop module', error)
  }
})()
