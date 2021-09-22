"use strict";

const CONTRACT_ADDRESS = "0xfB6A74fF4B5DE33248F92e3DfaDd643ad92621BD";
const ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "numberToken",
        "type": "uint256"
      }
    ],
    "name": "mintTokenOnSale",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "price",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "status",
    "outputs": [
      {
        "internalType": "enum NFTBase.STATUS",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "giveAways",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "numberToken",
        "type": "uint256"
      }
    ],
    "name": "mintTokenOnPreSale",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
];

const OPENSEA_BASE_URL = "https://testnets.opensea.io/assets";
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
// Set INFURA_ID to empty if you don't want to use WalletConnect
const INFURA_ID = "da08f23f6ff045e0adbbbb0ceb1318c6";
const Fortmatic = window.Fortmatic;
// Set FORTMATIC_PK to empty if you don't want to use Formatic
const FORTMATIC_PK = "pk_live_F1478434631DD015";
const evmChains = window.evmChains;
const MAX_MINT_PER_CLICK = 5;

// Web3modal instance
let $web3Modal

// Chosen wallet provider given by the dialog window
let $provider;

// Address of the selected account
let $selectedAccount;

// Contract
let $contract;

let $web3

async function mintToken() {

  let numberOfMints = 1;
  const $nomInput = document.querySelector('#nft__numberOfMints');
  if ($nomInput) {
    let nomVal = parseInt($nomInput.value);
    if (!isNaN(nomVal) && !(nomVal < 1 || nomVal > MAX_MINT_PER_CLICK)) {
      numberOfMints = nomVal;
    }
  }

  const BN = $web3.utils.BN;

  const status = await $contract.methods.status().call();

  if (status == 0) {
    notyf.error('You can not mint token now!!!');
  }

  const price = await $contract.methods.price().call();


  let config;

  if (status == 1) {

    let giveaway = await $contract.methods.giveAways($selectedAccount).call();
    let giveawayBN = new BN(giveaway);
    let numberOfMintsBN = new BN(numberOfMints);


    let amount = (giveawayBN.gte(numberOfMintsBN)) ? new BN(0) : numberOfMintsBN.sub(giveawayBN);
    config = {
      value: amount.mul(new BN(price)),
      from: $selectedAccount
    }

    $contract.methods.mintTokenOnPreSale(`${numberOfMints}`).estimateGas(config).then(async (gasEsimate) => {
      const gasBN = new BN(gasEsimate);
      config['gas'] = gasBN.add(gasBN.div(new BN(10)));

      notyf.success("Transaction minting ... Please sign transaction!!!")

      const tx = await $contract.methods.mintTokenOnPreSale(`${numberOfMints}`).send(config)
      notyf.success("Transaction minted at blockhash" + tx.blockHash)

    }).catch(error => {
      notyf.error(error.message)
    })
    return;
  }

  if (status == 2) {
    config = {
      value: new BN(price).mul(new BN(numberOfMints)),
      from: $selectedAccount
    }
    $contract.methods.mintTokenOnSale(`${numberOfMints}`).estimateGas(config).then(async (gasEsimate) => {
      const gasBN = new BN(gasEsimate);
      config['gas'] = gasBN.add(gasBN.div(new BN(10)));

      notyf.success("Transaction minting ... Please sign transaction!!!")

      const tx = await $contract.methods.mintTokenOnSale(`${numberOfMints}`).send(config)
      notyf.success("Transaction minted at blockhash" + tx.blockHash)

    }).catch(error => {
      notyf.error(error.message)
    })
    return;
  }
}

function mintTokenForCreator() {

  $provider
    .getGasPrice()
    .then(async (currentGasPrice) => {

      let config = {}

      try {

        await $contract.mintTokenForCreator(config);

      } catch (error) {
        // Handle error
      }

    });

}

function mintPreSaleToken() {

  $provider
    .getGasPrice()
    .then(async (currentGasPrice) => {

      let config = {}

      try {

        await $contract.mintPreSaleToken(config);

      } catch (error) {
        // Handle error
      }

    });

}

function receiveGift() {

  $provider
    .getGasPrice()
    .then(async (currentGasPrice) => {

      let config = {}

      try {

        await $contract.receiveGift(config);

      } catch (error) {
        // Handle error
      }

    });

}

/**
 * Setup the orchestra
 */
function init() {
  // Check that the web page is run in a secure context,
  // as otherwise MetaMask won't be available
  if (location.protocol !== 'https:') {
    // https://ethereum.stackexchange.com/a/62217/620
    // const alert = document.querySelector("#alert-error-https");
    // alert.style.display = "block";
    // document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
    // return;
    $logger.warn("Not HTTPS");
  }
  const providerOptions = {};
  if (INFURA_ID) {
    providerOptions.walletconnect = {
      package: WalletConnectProvider,
      options: {
        infuraId: INFURA_ID,
      }
    }
  }
  if (FORTMATIC_PK) {
    providerOptions.fortmatic = {
      package: Fortmatic,
      options: {
        key: FORTMATIC_PK
      }
    }
  };
  $web3Modal = new Web3Modal({
    cacheProvider: false,
    providerOptions,
    disableInjectedProvider: false,
  });
  $logger.info("Web3Modal instance is", $web3Modal);
}

async function onConnect(e) {
  $logger.info("Opening the dialog", $web3Modal);
  try {
    $provider = await $web3Modal.connect();
  } catch (e) {
    $logger.info("Could not get a wallet connection", e);
    return;
  }

  $provider.on("accountsChanged", (accounts) => {
    fetchAccountData()
      .then(({ network, account }) => {
        updateAccountPanel(network, account);
      });
  });

  $provider.on("chainChanged", (chainId) => {
    fetchAccountData()
      .then(({ network, account }) => {
        updateAccountPanel(network, account);
      });
  });

  await refreshAccountData()
    .then(({ network, account }) => {
      showAccountPanel(network, account);
    });
}

/**
 * Disconnect wallet button pressed.
 */
async function onDisconnect(e) {
  const evt = e || window.event;
  disableButton(evt);

  $logger.info("Killing the wallet connection", $provider);
  // TODO: Which providers have close method?
  if ($provider.disconnect) {
    await $provider.disconnect();
    // If the cached provider is not cleared,
    // WalletConnect will default to the existing session
    // and does not allow to re-scan the QR code with a new wallet.
    // Depending on your use case you may want or want not his behavir.
    await $web3Modal.clearCachedProvider();
    $provider = null;
    $contract = null;
  }
  $selectedAccount = null;
  setTimeout(() => {
    hideAccountPanel();
  });
}

/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */
async function fetchAccountData() {
  // Get a Web3 instance for the wallet
  $web3 = new Web3($provider);
  $logger.info("Web3 instance is", $web3);

  // Set contract based on selected account
  $contract = new $web3.eth.Contract(ABI, CONTRACT_ADDRESS);

  // Get connected chain id from Ethereum node
  const chainId = await $web3.eth.getChainId();
  // Load chain information over an HTTP API
  const chainData = evmChains.getChain(chainId);
  $logger.info("chainId is", chainId, ", Chain data name is", chainData.name);

  // Get list of accounts of the connected wallet
  const accounts = await $web3.eth.getAccounts();
  $logger.info("Got accounts", accounts);

  // MetaMask does not give you all accounts, only the selected account
  $selectedAccount = accounts[0];
  $logger.info("Account", $selectedAccount);

  const accountResolvers = accounts.map(async (address) => {
    const balance = await $web3.eth.getBalance(address)
    const ethBalance = $web3.utils.fromWei(balance, "ether");
    const humanFriendlyBalance = parseFloat(ethBalance).toFixed(4);
    $logger.info("Account at", address, " has the balance of approximately", humanFriendlyBalance);
  });
  await Promise.all(accountResolvers);
  return {
    network: chainData.name,
    account: $selectedAccount
  }
}

async function refreshAccountData() {
  return await fetchAccountData($provider);
}

function updateAccountPanel(network, account) {
  hideAccountPanel();
  setTimeout(() => {
    showAccountPanel(network, account);
  }, 750);
}

function hideAccountPanel() {
  const wrapper = document.querySelector("#nft__wrapper");
  if (wrapper) {
    wrapper.classList.remove('visible');
    setTimeout(() => {
      wrapper.remove();
    }, 250);
  }
}

function showAccountPanel(network, account) {
  if (document.querySelector('#nft__wrapper')) {
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.setAttribute("id", "nft__wrapper");
  const minusIcon = `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="minus" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16"><path fill="currentColor" d="M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z" class=""></path></svg>`;
  const plusIcon = `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="plus" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16"><path fill="currentColor" d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z" class=""></path></svg>`;
  const template = `
    <style>
      #nft__wrapper {
        --x-translate: -15px;
        --y-translate: 0px;
        position: fixed;
        left: 15px;
        bottom: 15px;
        border-radius: 3px;
        background-color: #79244d;
        color: white;
        box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.1);
        pointer-events: none;
        z-index: -1;
        opacity: 0;
        transform: translate(var(--x-translate, 0), var(--y-translate, 0));
        transition: 150ms ease-in-out;
        transition-property: opacity, transform;
      }
      #nft__wrapper.visible {
        --x-translate: 0px;
        z-index: 10000000;
        opacity: 1;
        pointer-events: auto;
      }
      #nft__panel {
        position: relative;
        padding: 20px;
      }
      #nft__panel .nft__header {
        text-align: right;
      }
      #nft__panel .nft__header #btn-disconnect {
        font-size: 75%;
        padding: 2px 5px;
        background-color: #9caab3;
        color: #000000;
        border-style: solid;
      }
      #nft__wrapper .nft__row {
        margin-bottom: 1rem;
      }
      #nft__wrapper .nft__button {
        padding: 8px 16px;
        font-weight: bold;
        color: white;
        background-color: black;
        border-color: black;
        border-radius: 3px;
        cursor: pointer;
        transition: 150ms ease-in-out;
        transition-property: color;
      }
      #nft__wrapper .nft__button:hover {
        color: #C9665F !important;
      }
      #nft__wrapper #btn_mint {
        width: 100%;
      }
      .nft__input-group {
        width: 100%;
        display: flex;
      }
      .nft__input-group > input {
        flex-grow: 1;
      }
      .nft__input-group > button {
        flex-shrink: 0;
        min-width: 56px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        border-top-left-radius: 0px;
        border-bottom-left-radius: 0px;
      }
      .nft__spinner > .nft__button {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .nft__spinner > .nft__button:first-of-type {
        border-top-right-radius: 0px;
        border-bottom-right-radius: 0px;
      }
      .nft__spinner > .nft__button:last-of-type {
        border-top-left-radius: 0px;
        border-bottom-left-radius: 0px;
      }
      .nft__spinner > input {
        font-size: 105%;
        font-weight: bold;
        text-align: center;
      }
      .nft__spinner > input::-webkit-outer-spin-button,
      .nft__spinner > input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      .nft__spinner > input[type=number] {
        -moz-appearance: textfield;
      }
      .nft__spinner > input::placeholder {
        font-size: .75rem;
        font-weight: normal;
      }
      #nft__panel label {
        display: inline-block;
        margin-bottom: 4px;
      }
      @media screen and (max-width: 480px) {
        #nft__wrapper {
          right: 10px;
        }
        #nft__wrapper #nft__selected-account {
          font-size: 12px;
        }
      }
    </style>
    <div id="nft__panel">
      <div class="nft__header">
        <button id="btn-disconnect" class="nft__button" type="button" onclick="onDisconnect()">Disconnect</button>
      </div>
      <div class="nft__body">
        <div class="nft__row">
          <b>Connected blockchain:</b>
          <div id="nft__network-name">${network}</div>
        </div>
        <div class="nft__row">
          <b>Selected account:</b>
          <div id="nft__selected-account">${account}</div>
        </div>
        <div class="nft__row"><hr /></div>
        <div class="nft__row">
          <label for="numberOfMints">Number of mints (up to ${MAX_MINT_PER_CLICK})</label>
          <div class="nft__input-group nft__spinner">
            <button type="button" class="nft__button" id="decrease-mint">${minusIcon}</button>
            <input type="number" name="numberOfMints" id="nft__numberOfMints" min="1" max="${MAX_MINT_PER_CLICK}" step="1" value="1" placeholder="Up to ${MAX_MINT_PER_CLICK} times per click" />
            <button type="button" class="nft__button" id="increase-mint">${plusIcon}</button>
          </div>
        </div>
        <div class="nft__row">
          <button type="button" class="nft__button" id="btn_mint">MINT TOKEN</button>
        </div>
      </div>
      <div class="nft__footer"></div>
    </div>
  `;
  wrapper.innerHTML = template;
  document.body.appendChild(wrapper);
  const $input = wrapper.querySelector('#nft__numberOfMints');
  // In order to prevent typing characters other than integer and backspace
  $input.addEventListener('keypress', (evt) => {
    if (evt.which != 8 && evt.which != 0 && evt.which < 48 || evt.which > 57) {
      // 8 for backspace
      // 48-57 for numbers 0-9
      evt.preventDefault();
    }
  });
  // In order to prevent pasting invalid input, and backspacing
  $input.addEventListener('input', (evt) => {
    const value = parseInt(evt.target.value);
    if (value < 1 || value > MAX_MINT_PER_CLICK || (evt.inputType === 'insertFromPaste' && isNaN(value))) {
      evt.target.value = 1;
    }
    if (evt.inputType === 'deleteContentBackward') {
      setTimeout(() => {
        evt.target.value = 1;
      }, 250);
    }
  });
  wrapper.querySelector('#increase-mint').addEventListener('click', () => {
    if ($input.value === '' || $input.value < 1) {
      $input.value = 1;
      return;
    }
    if ($input.value >= MAX_MINT_PER_CLICK) {
      $input.value = MAX_MINT_PER_CLICK;
      return;
    }
    $input.value = parseInt($input.value) + 1;
  });
  wrapper.querySelector('#decrease-mint').addEventListener('click', () => {
    if ($input.value === '' || $input.value < 1) {
      $input.value = 1;
      return;
    }
    if ($input.value == 1) {
      return;
    }
    let valueChange = parseInt($input.value) - 1;
    $input.value = valueChange < 1 ? 1 : valueChange;
  });

  let $bntMint = document.querySelector("#btn_mint");
  $bntMint.addEventListener('click', mintToken);

  setTimeout(() => {
    wrapper.classList.add("visible");
  }, 250);
}

const $logger = {
  info: (...msgs) => {
    if (document.designMode !== "on") {
      return;
    }
    console.log(...msgs);
  },
  warn: (...msgs) => {
    console.warn(...msgs);
  }
}

const disableButton = (evt) => {
  if (!evt) {
    return;
  }
  const isButton = (asButton) => {
    try {
      //Using W3 DOM2 (works for FF, Opera and Chrome)
      return asButton instanceof HTMLElement;
    } catch (e) {
      //Browsers not supporting W3 DOM2 don't have HTMLElement and
      //an exception is thrown and we end up here. Testing some
      //properties that all elements have (works on IE7)
      return (typeof asButton === "object") &&
        (asButton.nodeType === 1) && (typeof asButton.style === "object") &&
        (typeof asButton.ownerDocument === "object");
    }
  }
  if (isButton(evt.target)) {
    evt.target.setAttribute('disabled', 'disabled');
  }

}

var notyf;

window.addEventListener('load', async () => {
  init();
  const $btnConnect = document.querySelector('#btn__connect');
  if ($btnConnect) {
    $btnConnect.addEventListener('click', onConnect);

  }
  notyf = new Notyf({
    duration: 12000,
    position: { x: 'left', y: 'top' },
    dismissible: true
  });
});