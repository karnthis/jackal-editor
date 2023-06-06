<script setup lang="ts">
import { ref } from 'vue'
import { Editor } from '@bytemd/vue-next'
import gfm from '@bytemd/plugin-gfm'
import 'bytemd/dist/index.css'

import {WalletHandler, FileIo, FileIoI, FileUploadHandler, StorageHandler, getFileTreeData, IUploadList} from 'jackal.js'

let wallet = ref({})
const walletActive = ref(false)
let fileIo: FileIoI = null

const mSignerChain = 'jackal-1'
const mainnet = {
  signerChain: mSignerChain,
  enabledChains: [mSignerChain],
  queryAddr: 'https://grpc.jackalprotocol.com',
  txAddr: 'https://rpc.jackalprotocol.com',
  chainConfig: { // mainnet chain config
      chainId: mSignerChain,
      chainName: 'Jackal',
      rpc: 'https://rpc.jackalprotocol.com',
      rest: 'https://api.jackalprotocol.com',
      bip44: {
        coinType: 118
      },
      coinType: 118,
      stakeCurrency: {
        coinDenom: 'JKL',
        coinMinimalDenom: 'ujkl',
        coinDecimals: 6
      },
      bech32Config: {
        bech32PrefixAccAddr: 'jkl',
        bech32PrefixAccPub: 'jklpub',
        bech32PrefixValAddr: 'jklvaloper',
        bech32PrefixValPub: 'jklvaloperpub',
        bech32PrefixConsAddr: 'jklvalcons',
        bech32PrefixConsPub: 'jklvalconspub'
      },
      currencies: [
        {
          coinDenom: 'JKL',
          coinMinimalDenom: 'ujkl',
          coinDecimals: 6
        }
      ],
      feeCurrencies: [
        {
          coinDenom: 'JKL',
          coinMinimalDenom: 'ujkl',
          coinDecimals: 6,
          gasPriceStep: {
            low: 0.002,
            average: 0.002,
            high: 0.02
          }
        }
      ],
      features: []
  }
}

const connectWallet = async function() {

  const walletConfig = {
    selectedWallet: 'keplr',
    signerChain: mainnet.signerChain,
    enabledChains: mainnet.enabledChains,
    queryAddr: mainnet.queryAddr,
    txAddr: mainnet.txAddr,
    chainConfig: mainnet.chainConfig
  }

  // Hooking up the wallet to your app
  wallet.value = await WalletHandler.trackWallet(walletConfig)

  fileIo = await FileIo.trackIo(wallet.value, '1.0.9')

  const listOfFolders = ["editor-demo"] 
  // you can create as many folders as you would like this way

  // after the first time, this code can be used instead. this will only create new folders if they don't already exist
  await fileIo.verifyFoldersExist(listOfFolders)
  walletActive.value = true
}

const uploadFile = async function () {

  const fileName = "test.md"


  const blob = new Blob([content.value], { type: 'text/plain' });
  const toUpload = new File([blob], fileName, {type: "text/plain"});

  const parentFolderPath = "s/editor-demo" // replace this with your own path
  const handler = await FileUploadHandler.trackFile(toUpload, parentFolderPath)

  const parent = await fileIo.downloadFolder(parentFolderPath)
  console.log(parent)
  const uploadList: IUploadList = {}
  uploadList[fileName] =  {
    data: null,
    exists: false, 
    handler: handler,
    key: fileName,
    uploadable: await handler.getForPublicUpload()
  }
  
  const details = await fileIo.staggeredUploadFiles(uploadList, parent, {counter: 0, complete: 0})
  console.log(details)

  const f = await getFileTreeData("s/editor-demo/" + fileName, wallet.value.getJackalAddress(), wallet.value.getQueryHandler())

  const fidList = JSON.parse(f.value.files.contents)
  const newFid = fidList.fids[0]
  console.log(newFid)

  alert("Success!")
}

const loadFile = async function () {

  const fileName = "test.md"

  const f = await getFileTreeData("s/editor-demo/" + fileName, wallet.value.getJackalAddress(), wallet.value.getQueryHandler())

  const fidList = JSON.parse(f.value.files.contents)
  const newFid = fidList.fids[0]

  const response = await fetch("https://jackal.link/f/" + newFid)
  content.value = await response.text()
  console.log(content.value)
}


let content = ref('')

const plugins = [gfm()]

const handleChange = (v: string) => {
  content.value = v
}
</script>

<template>
  <main>
    <button type="button" @click="connectWallet">{{ (walletActive.value == true) ? "Connected" : "Connect Wallet"}}</button>
    <button type="button" @click="uploadFile">Save</button>
    <button type="button" @click="loadFile">Load</button>
    <Editor :value="content" :plugins="plugins" @change="handleChange" />
  </main>
</template>

<style>
#app {
  max-width: 1280px;
  margin: 0 auto;
  font-weight: normal;
}

.bytemd {
  width: 80vw;
  height: calc(100vh - 200px);
}

.bytemd-body {
  text-align: left;
}
</style>