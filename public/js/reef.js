
var selectedAddress;

document.addEventListener('signer-change', (evt) => {
    var addr = evt.detail;
    selectedAddress = addr;
    resetUI();
    document.body.classList.add("extension-initialized");
    displaySignerAddress(addr);
    getContractValue(addr);
});
document.addEventListener('clear-error', clearError);
document.addEventListener('tx-progress', evt => {
    document.body.classList.add("transaction-progress");
});
document.addEventListener('dapp-connected', evt => {
    document.body.classList.add("connected");
});
document.addEventListener('tx-complete', evt => {
    document.body.classList.remove("transaction-progress");
});
document.addEventListener('display-error', (evt => {
    displayError(evt.detail);
}));
document.addEventListener('balance-value', (evt => {
    document.body.getElementsByClassName('reef-balance')[0].innerHTML = '<span style="font-weight:bold">Balance:</span> ' + evt.detail + ' <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/6951.png" height="17" width="17" alt=Reef Coin" />';
}));
document.addEventListener('evm-connected', () => document.body.classList.add("evm-connected"));
document.addEventListener('contract-value', (evt => {
    document.getElementsByClassName('contract-value')[0].innerHTML = 'CONTRACT VALUE: ' + evt.detail;
}));

function bindEvm(addr) {
    document.dispatchEvent(new CustomEvent('bind-evm-address', { detail: addr }));
}

function getContractValue(addr) {
    document.dispatchEvent(new CustomEvent('get-contract-value', { detail: addr }));
}

function toggleContractValue(addr) {
    document.dispatchEvent(new CustomEvent('toggle-contract-value', { detail: addr }));
}

function sendERC20Transfer(amount, to, contract) {
    document.dispatchEvent((new CustomEvent('send-erc20', { detail: { amount, contract, to } })));
}

function displayError(e) {
    resetUI();
    document.body.classList.add("reef-extension-error");
    document.getElementsByClassName('error-msg')[0].innerHTML = e.message || e;
}

function clearError() {
    document.body.classList.remove("reef-extension-error");
    document.getElementsByClassName('error-msg')[0].innerHTML = '';
}

async function displaySignerAddress(addr) {
    document.body.getElementsByClassName('selected-signer')[0].innerHTML = '<span style="font-weight:bold">Selected address:</span> ' + addr;
}

async function resetUI() {
    document.body.classList.remove("evm-connected");
    document.body.classList.remove("connected");
    document.body.classList.remove("reef-extension-error");
    document.getElementsByClassName('contract-value')[0].innerHTML = '';
    document.getElementsByClassName('selected-signer')[0].innerHTML = '';
    document.getElementsByClassName('reef-balance')[0].innerHTML = '';
    clearError();
}

function getFailedPaymentFees(blockNumber,extrinsicHash){
    document.dispatchEvent((new CustomEvent('get-failed-payment-fees',{detail:{
        blockNumber,
        extrinsicHash
    }})));
}

function getPaymentFees(blockNumber,extrinsicHash){
    document.dispatchEvent((new CustomEvent('get-payment-fees',{detail:{
        blockNumber,
        extrinsicHash
    }})));
}

function getBlockEvents(blockHash){
    document.dispatchEvent((new CustomEvent('get-block-events',{detail:{
        blockHash
    }})));
}

function checkIfFailedTx(blockHash,extrinsicIndex){
    document.dispatchEvent((new CustomEvent('check-failed-tx',{detail:{
        blockHash,
        extrinsicIndex
    }})));
}

function logBlockExtrinsics(blockNumber){
    document.dispatchEvent((new CustomEvent('log-block-extrinsics',{detail:{
        blockNumber,
    }})));
}