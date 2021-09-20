"use strict";

const CONTRACT_ADDRESS = "";
const ABI = [

];
const OPENSEA_BASE_URL = "https://testnets.opensea.io/assets";
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const INFURA_ID = "da08f23f6ff045e0adbbbb0ceb1318c6";
const Fortmatic = window.Fortmatic;
const FORTMATIC_PK = "pk_live_F1478434631DD015";
const evmChains = window.evmChains;

// Web3modal instance
let $web3Modal

// Chosen wallet provider given by the dialog window
let $provider;

// Address of the selected account
let $selectedAccount;

// Contract
let $contract;

function mintSaleToken() {

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
  if(location.protocol !== 'https:') {
    // https://ethereum.stackexchange.com/a/62217/620
    // const alert = document.querySelector("#alert-error-https");
    // alert.style.display = "block";
    // document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
    // return;
    $logger.warn("Not HTTPS");
  }
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: INFURA_ID,
      }
    },
    fortmatic: {
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
  } catch(e) {
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
      notyf.success("You're connected")
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
  if($provider.close) {
    await $provider.close();
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
  }, 1000);
}

/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */
async function fetchAccountData() {
  // Get a Web3 instance for the wallet
  const web3 = new Web3($provider);
  $logger.info("Web3 instance is", web3);

  // Set contract based on selected account
  $contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

  // Get connected chain id from Ethereum node
  const chainId = await web3.eth.getChainId();
  // Load chain information over an HTTP API
  const chainData = evmChains.getChain(chainId);
  $logger.info("chainId is", chainId, ", Chain data name is", chainData.name);

  // Get list of accounts of the connected wallet
  const accounts = await web3.eth.getAccounts();
  $logger.info("Got accounts", accounts);

  // MetaMask does not give you all accounts, only the selected account
  $selectedAccount = accounts[0];
  $logger.info("Account", $selectedAccount);

  const accountResolvers = accounts.map(async (address) => {
    const balance = await web3.eth.getBalance(address)
    const ethBalance = web3.utils.fromWei(balance, "ether");
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
  }, 500);
}

function hideAccountPanel() {
  const wrapper = document.querySelector("#nft__wrapper");
  if (wrapper) {
    wrapper.querySelector('#nft__panel').classList.remove('visible');
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
  const template = `
    <style>
      #nft__wrapper #nft__panel {
        --x-translate: -15px;
        --y-translate: 0px;
        position: fixed;
        left: 15px;
        bottom: 15px;
        padding: 15px 25px;
        border-radius: 3px;
        background-color: #79244d;
        box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.1);
        pointer-events: none;
        z-index: -1;
        opacity: 0;
        transform: translate(var(--x-translate, 0), var(--y-translate, 0));
        transition: 150ms ease-in-out;
        transition-property: opacity, transform;
      }
      #nft__wrapper #nft__panel.visible {
        --x-translate: 0px;
        z-index: 10000000;
        opacity: 1;
        pointer-events: auto;
      }
      #nft__wrapper .nft__row {
        margin-bottom: 1rem;
      }
      #nft__wrapper #btn-disconnect {
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
      #nft__wrapper #btn-disconnect:hover {
        color: #C9665F !important;
      }
    </style>
    <div id="nft__panel">
      <div class="nft__row">
        <b>Connected blockchain:</b>
        <div id="nft__network-name">${network}</div>
      </div>
      <div class="nft__row">
        <b>Selected account:</b>
        <div id="nft__selected-account">${account}</div>
      </div>
      <div class="">
        <button id="btn-disconnect" type="button" onclick="onDisconnect()">Disconnect</button>
      </div>
    </div>
  `;
  wrapper.innerHTML = template;
  document.body.appendChild(wrapper);
  setTimeout(() => {
    wrapper.querySelector('#nft__panel').classList.add("visible");
  });
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
    } catch(e) {
      //Browsers not supporting W3 DOM2 don't have HTMLElement and
      //an exception is thrown and we end up here. Testing some
      //properties that all elements have (works on IE7)
      return (typeof asButton === "object") &&
        (asButton.nodeType === 1 ) && (typeof asButton.style === "object") &&
        (typeof asButton.ownerDocument ==="object");
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