import { useState, useEffect } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { StacksMocknet } from '@stacks/network'
import {
  AppConfig,
  UserSession,
  showConnect,
  openContractCall,
} from '@stacks/connect'
import {
  NonFungibleConditionCode,
  FungibleConditionCode,
  createAssetInfo,
  makeStandardNonFungiblePostCondition,
  makeStandardSTXPostCondition,
  bufferCVFromString,
  standardPrincipalCV,
} from '@stacks/transactions'

const Home: NextPage = () => {
  const appConfig = new AppConfig(['publish_data'])
  const userSession = new UserSession({ appConfig })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState({})
  const [loggedIn, setLoggedIn] = useState(false)

  // Set up the network and API
  const network = new StacksMocknet()

  function authenticate() {
    showConnect({
      appDetails: {
        name: 'Fabulous Frogs',
        icon: 'https://assets.website-files.com/618b0aafa4afde65f2fe38fe/618b0aafa4afde2ae1fe3a1f_icon-isotipo.svg',
      },
      redirectTo: '/',
      onFinish: () => {
        window.location.reload()
      },
      userSession,
    })
  }

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setUserData(userData)
      })
    } else if (userSession.isUserSignedIn()) {
      setLoggedIn(true)
      setUserData(userSession.loadUserData())
    }
  }, [])

  const mint = async () => {
    const postConditionAddress =
      userSession.loadUserData().profile.stxAddress.testnet
    const nftPostConditionCode = NonFungibleConditionCode.Owns
    const assetAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
    const assetContractName = 'fabulous-frogs'
    const assetName = 'fabulous-frogs'
    const tokenAssetName = bufferCVFromString('fabulous-frogs')
    const nonFungibleAssetInfo = createAssetInfo(
      assetAddress,
      assetContractName,
      assetName
    )

    const stxConditionCode = FungibleConditionCode.LessEqual;
    const stxConditionAmount = 50000000; // denoted in microstacks

    const postConditions = [
      makeStandardNonFungiblePostCondition(
        postConditionAddress,
        nftPostConditionCode,
        nonFungibleAssetInfo,
        tokenAssetName
      ),
      makeStandardSTXPostCondition(
        postConditionAddress,
        stxConditionCode,
        stxConditionAmount
      )
    ]

    const functionArgs = [
      standardPrincipalCV(
        userSession.loadUserData().profile.stxAddress.testnet
      ),
    ]

    const options = {
      contractAddress: assetAddress,
      contractName: 'fabulous-frogs',
      functionName: 'mint',
      functionArgs,
      network,
      postConditions,
      appDetails: {
        name: 'Fabulous Frogs',
        icon: 'https://assets.website-files.com/618b0aafa4afde65f2fe38fe/618b0aafa4afde2ae1fe3a1f_icon-isotipo.svg',
      },
      onFinish: (data: any) => {
        console.log(data)
      },
    }

    await openContractCall(options)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Fabulous Frogs</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-6xl font-bold">Mint Your Fabulous Frog</h1>

        <p className="mt-4 w-full text-xl md:w-1/2">
          Fabulous Frogs are the most fabulous amphibians this side of the
          Mississippi. You can mint yours for only 50 STX.
        </p>

        <div className="mt-6 flex max-w-4xl flex-wrap items-center justify-around sm:w-full">
          {loggedIn ? (
            <button
              onClick={() => mint()}
              className="rounded bg-indigo-500 p-4 text-2xl text-white hover:bg-indigo-700"
            >
              Mint
            </button>
          ) : (
            <button
              className="bg-white-500 mb-6 rounded border-2 border-black py-2 px-4 font-bold hover:bg-gray-300"
              onClick={() => authenticate()}
            >
              Connect to Wallet
            </button>
          )}
        </div>
      </main>
    </div>
  )
}

export default Home
