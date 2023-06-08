<script setup lang="ts">
// @ts-ignore
import { ref } from 'vue'
// @ts-ignore
import { Editor } from '@bytemd/vue-next'
// @ts-ignore
import gfm from '@bytemd/plugin-gfm'
import 'bytemd/dist/index.css'
// @ts-ignore
import {WalletHandler, FileIo, FileIoI, FileUploadHandler, StorageHandler, getFileTreeData, IUploadList} from 'jackal.js'

let wallet = ref({})
const walletActive = ref(false)
let fileIo: FileIoI = null
let data = ref([])

const path = "editor-demo"

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
// @ts-ignore
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

  const listOfFolders = [path] 
  // you can create as many folders as you would like this way

  // after the first time, this code can be used instead. this will only create new folders if they don't already exist
  await fileIo.verifyFoldersExist(listOfFolders)
  walletActive.value = true
  updateFileList()
}

// @ts-ignore
const uploadFile = async function () {

  const fileName = globFileName.value
  if (fileName.length == 0) {
    alert("file needs name")
    return
  }


  const blob = new Blob([content.value], { type: 'text/plain' });
  const toUpload = new File([blob], fileName, {type: "text/plain"});

  const parentFolderPath = "s/" + path // replace this with your own path
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

  const f = await getFileTreeData("s/" + path + "/" + fileName, wallet.value.getJackalAddress(), wallet.value.getQueryHandler())

  const fidList = JSON.parse(f.value.files.contents)
  const newFid = fidList.fids[0]
  console.log(newFid)

  updateFileList()
  alert("Success!")
}

// @ts-ignore
const loadFile = async function (fileName : string) {


  const f = await getFileTreeData("s/" + path + "/" + fileName, wallet.value.getJackalAddress(), wallet.value.getQueryHandler())

  const fidList = JSON.parse(f.value.files.contents)
  const newFid = fidList.fids[0]

  const response = await fetch("https://jackal.link/f/" + newFid)
  content.value = await response.text()
  console.log(content.value)

  globFileName.value = fileName
}


let content = ref('')
let globFileName = ref('')

// @ts-ignore
const plugins = [gfm()]

// @ts-ignore
const handleChange = (v: string) => {
  content.value = v
}


const updateFileList = async function (){
  const listFiles = await fileIo.downloadFolder("s/" + path)
  const files = listFiles.folderDetails.fileChildren

  let d = []

  let x = 0
  for (const key of Object.keys(files)) {
    const f = files[key]

    const fDetails = await getFileTreeData("s/" + path + "/" + f.name, wallet.value.getJackalAddress(), wallet.value.getQueryHandler())
    console.log(fDetails)
    const fidList = JSON.parse(fDetails.value.files.contents)
    const newFid = fidList.fids[0]

    d[x] = {name: key, fid: newFid}
    x ++
  }
  console.log(d)
  data.value = d
}
</script>

<template >
  <main>
    <button type="button" @click="connectWallet">{{ (walletActive.value == true) ? "Connected" : "Connect Wallet"}}</button>
    <input  type="text" v-model="globFileName">
    <button type="button" @click="uploadFile">Save</button>
    <Editor :value="content" :plugins="plugins" @change="handleChange" />
    <div class="files">
      <div class="card" v-for="item in data" :key="item.name" @click="function () {
        // @ts-ignore
          loadFile(item.name)
        }">
        <h1>{{item.name}}</h1>
      </div>
    </div>
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
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 30px;
  margin-top: 30px;
}

.bytemd-body {
  text-align: left;
}

.files {
    display: grid;
    grid-auto-flow: row; 
    grid-template-columns: 1fr 1fr 1fr; 
    gap: 10px 10px; 
}

.card > h1 {
  font-size: 1.6em;
}

.card {
  border-radius: 5px;
  border-style: solid;
  padding: 10px;
  overflow: hidden;
  cursor: pointer;
}

</style>
