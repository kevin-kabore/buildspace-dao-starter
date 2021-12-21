import {ThirdwebSDK} from '@3rdweb/sdk'
import ethers from 'ethers'

// Importing and configuring our .env file that we use to securely store our environment variables
import dotenv from 'dotenv'
dotenv.config()

// make sure .env file is working
if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === '') {
  console.log('🛑 Private key not found.')
}

if (!process.env.ALCHEMY_API_URL || process.env.ALCHEMY_API_URL === '') {
  console.log('🛑 Alchemy API URL not found.')
}

if (!process.env.WALLET_ADDRESS || process.env.WALLET_ADDRESS === '') {
  console.log('🛑 Wallet Address not found.')
}

const sdk = new ThirdwebSDK(
  new ethers.Wallet(
    process.env.PRIVATE_KEY,
    ethers.getDefaultProvider(process.env.ALCHEMY_API_URL), // RPC URL
  ),
)

;(async () => {
  try {
    const apps = await sdk.getApps()
    console.log('apps:', apps)
    console.log('Your app address is:', apps[0].address)
  } catch (error) {
    console.error('Failed to get apps from the sdk', error)
    process.exit(1)
  }
})()

// exporting the initialized thirdweb SDK so that
// we can use it in our other scripts
export default sdk
