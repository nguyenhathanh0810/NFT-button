# NFT-button

Quick guides to use nft buttons

1. Open the html page you plan to inject the buttons, e.g **index.html**
2. Add these style links and scripts as following:
```html
<!DOCTYPE html>
<html lang="en">
<head>

  <!--     Your page's title, metas and other style links -->

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.css">

</head>
<body>

  <!--     Your webpage body -->

  <script type="text/javascript" src="https://unpkg.com/web3@1.5.2/dist/web3.min.js"></script>
  <script type="text/javascript" src="https://unpkg.com/web3modal@1.9.4/dist/index.js"></script>
  <script type="text/javascript" src="https://unpkg.com/evm-chains@0.2.0/dist/umd/index.min.js"></script>
  <script type="text/javascript" src="https://unpkg.com/@walletconnect/web3-provider@1.2.1/dist/umd/index.min.js"></script>
  <script type="text/javascript" src="https://unpkg.com/fortmatic@2.0.6/dist/fortmatic.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.js"></script>
  
  <script src="<path-to-where-you-place-this-js-file>/nft-buttons.js"></script>
</body>
```
3. By default, the <code>nft-buttons.js</code> will try to bind the NFT start point to a html element with id=**btn__connect**<br>
E.g:
```
  <button id="btn__connect">
    Start minting
  </button>
```
4. You can also bind that action to any of your html element following this:<br>
```
  <button onclick="onConnect()">
    Start minting
  </button>
```
And that's all you need to have it visible and working.
