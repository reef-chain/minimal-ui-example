import './polyfill';
import {flipIt, getFlipperValue} from "./flipperContract";
import {subscribeToBalance, toREEFBalanceNormal} from "./signerUtil";
import {getReefExtension} from "./extensionUtil";
import {Provider, Signer} from "@reef-chain/evm-provider";
import { extension as reefExt } from '@reef-chain/util-lib';
import {sendERC20Transfer, sendNativeREEFTransfer} from "./transferUtil";
import {isMainnet} from "@reef-chain/evm-provider";
import {getProviderFromUrl, initProvider} from "./providerUtil";
import { ReefInjected } from '@reef-chain/util-lib/dist/dts/extension';

let selectedSigner: Signer;
let selSignerConnectedEVM: boolean;
let unsubBalance = () => {
};

document.addEventListener('bind-evm-address', async (evt: any) => {
    if (await isSelectedAddress(evt.detail as string, selectedSigner, 'Error connecting EVM. Selected signer is not the same.')) {
        bindEvm(selectedSigner);
    }
});

document.addEventListener('get-contract-value', async (evt: any) => {
    if (await isSelectedAddress(evt.detail as string, selectedSigner, 'Error getting contract value. Selected signer is not the same.')) {
        getContractValue(selectedSigner);
    }
});

document.addEventListener('toggle-contract-value', async (evt: any) => {
    if (await isSelectedAddress(evt.detail as string, selectedSigner, 'Error changing contract value. Selected signer is not the same.')) {
        toggleContractValue(selectedSigner);
    }
});

document.addEventListener('send-erc20', async (evt: any) => {
    sendERC20Transfer(evt.detail.amount, selectedSigner, evt.detail.to, evt.detail.contract).subscribe((val: any) => {
        // TODO display transaction status in UI
        console.log('TX =', val)
    }, (err) => console.log('TX ERC20 ERR=', err.message));
});

window.addEventListener('load',
    async () => {
        try {
            const extension = await getReefExtension('Minimal DApp Example') as reefExt.ReefInjected;

            // we can also get provider and signer
            // const prov = await extension.reefProvider.getNetworkProvider();
            // const signer = await extension.reefSigner.getSelectedSigner();
            // console.log("provider=",await prov.api.genesisHash.toString(), ' signer=',signer);

            const testRpcUrl = getProviderFromUrl();
            if (testRpcUrl) {
                console.log('test rpc=', testRpcUrl)

                let now = Date.now();
                const testProviderFromUrl = await initProvider(testRpcUrl);
                await testProviderFromUrl.api.isReadyOrError;
                console.log(`Provider ready in ${(Date.now() - now) / 1000} seconds`);
                now = Date.now();
                const evmNonce = await testProviderFromUrl.api.query.evm.accounts(
                    "0x6a816Ab55d0f161906886a7B9910938a03476a9F"
                );
                console.log(`EVM nonce fetched in ${(Date.now() - now) / 1000} seconds`);

                try {
                    console.log('calling author...');
                    await testProviderFromUrl.api.rpc.author.pendingExtrinsics()
                    console.log('check provider api');
                } catch (e) {
                    console.log('provider methods ok');
                }
            }

            extension.reefSigner.subscribeSelectedSigner(async (sig: reefExt.ReefSignerResponse) => {
                console.log("signer cb =", sig);
                try {
                    if (sig.status === reefExt.ReefSignerStatus.NO_ACCOUNT_SELECTED) {
                        throw new Error('Create account in Reef extension or make selected account visible.');
                    }
                    if (sig.status === reefExt.ReefSignerStatus.SELECTED_NO_VM_CONNECTION) {
                        throw new Error('Connect/bind selected account to Reef EVM.');
                    }
                    if (sig.data) {
                        console.log("signer connected to mainnet =", await isMainnet(sig.data));
                    }
                    setSelectedSigner(sig.data);
                } catch (err) {
                    displayError(err);
                }
            });
        } catch (e) {
            displayError(e);
        }
    });

async function isSelectedAddress(addr: string, selectedSigner: Signer, message: string) {
    const selAddr = await selectedSigner.getSubstrateAddress();
    if (addr !== selAddr) {
        displayError({message});
        return false;
    }
    return true;
}

function displayError(err) {
    document.dispatchEvent(new CustomEvent("display-error", {
        detail: err
    }));
}

function clearError() {
    document.dispatchEvent(new Event('clear-error'));
}

async function setSelectedSigner(sig) {
    selectedSigner = sig;
    unsubBalance();
    unsubBalance = await subscribeToBalance(sig, async (balFree) => await updateBalance(selectedSigner, balFree));
    let substrateAddress = await sig?.getSubstrateAddress();
    console.log("new signer=", substrateAddress);
    document.dispatchEvent(new CustomEvent('signer-change', {detail: substrateAddress}));
}

async function isEvmConnected(sig) {
    if (selSignerConnectedEVM) {
        return selSignerConnectedEVM;
    }
    selSignerConnectedEVM = await sig.isClaimed();
    return selSignerConnectedEVM;
}

async function updateBalance(sig, balFree) {
    let balanceNormal = toREEFBalanceNormal(balFree.toString());
    document.dispatchEvent(new CustomEvent('balance-value', {detail: balanceNormal}));

    var evmConnected = await isEvmConnected(sig);
    console.log("New SIGNER balance=", balanceNormal.toString(), ' EVM connected=', evmConnected);

    if (!evmConnected) {
        if (balanceNormal.lt('3')) {
            displayError('<p>To enable contract interaction you need to sign transaction with ~3REEF fee.<br/>To get 1000 testnet REEF simply type:<br/> <code>!drip ' + await sig.getSubstrateAddress() + '</code> <br/>in <a href="https://app.element.io/#/room/#reef:matrix.org" target="_blank">Reef matrix chat</a>. <br/>Listening on chain for balance update.</p>');
            return;
        }
    } else {
        document.dispatchEvent(new Event('evm-connected'));
    }
    clearError();
    document.dispatchEvent(new Event('dapp-connected'));
}

async function bindEvm(sig) {
    try {
        document.dispatchEvent(new Event('tx-progress'));
        await sig.claimDefaultAccount();
        document.dispatchEvent(new Event('tx-complete'));
        document.dispatchEvent(new Event('evm-connected'));
    } catch (e) {
        displayError(e);
    }
}

async function getContractValue(sig) {
    try {
        const ctrRes = await getFlipperValue(sig);
        document.dispatchEvent(new CustomEvent('contract-value', {detail: ctrRes}));
    } catch (e) {
        document.dispatchEvent(new CustomEvent('contract-value', {detail: e.message}));
    }
}

async function toggleContractValue(sig) {
    document.dispatchEvent(new Event('tx-progress'));
    try {
        var ctrRes = await flipIt(sig);
        console.log("flipped=", ctrRes);
        getContractValue(sig);
    } catch (e) {
        displayError(e);
    }
    document.dispatchEvent(new Event('tx-complete'));
}

document.addEventListener('get-failed-payment-fees', async (evt: any) => {
    try {
        await getFailedPaymentFees(evt.detail.blockNumber,evt.detail.extrinsicHash);
    } catch (error) {
        console.log("error===",error);
    }
});

document.addEventListener('get-payment-fees', async (evt: any) => {
    try {
        await getPaymentFee(evt.detail.blockNumber,evt.detail.extrinsicHash);
    } catch (error) {
        console.log("error===",error);
    }
});


async function getFailedPaymentFees(blockNumber:any,extrinsicHash:string) {
    const extension = await getReefExtension('Minimal DApp Example') as ReefInjected;

    // we can also get provider and signer
    const provider = await extension.reefProvider.getNetworkProvider();
    // const blockNumber =  12319401;
    // const extrinsicHash = '0xf3277dd63b7be2f74b27f72e47efcca0e1b38f32648116311e68e84d4099864f';
    console.log('GET FEE for 📦 block nr=', blockNumber, ' extrinsic hash=', extrinsicHash);

    // Get block hash (if we only have block number)
    const blockHash = await provider.api.rpc.chain.getBlockHash(blockNumber);
    const { block } = await provider.api.rpc.chain.getBlock(blockHash);
    let extrinsicIndex = undefined;

    if (block.extrinsics.length) {
        console.log('extrinsic hashes in block ', block.extrinsics.map(ext => ext.hash.toHuman()));
        extrinsicIndex = block.extrinsics.findIndex(ext => ext.hash.toHuman() === extrinsicHash);
    }

    if (extrinsicIndex == null) {
        console.log('Extrinsic with hash=', extrinsicHash, ' does not exist in block ', blockNumber);
        return;
    }

    const queryInfo = await provider.api.rpc.payment.queryInfo(block.extrinsics[extrinsicIndex].toHex(), block.header.parentHash);
    // const queryFeeDetails = await provider.api.rpc.payment.queryFeeDetails(block.extrinsics[extrinsicIndex].toHex(), block.header.parentHash);

    const estimatedPartialFee = queryInfo.partialFee.toBigInt();
    console.log('actual partial fee for failed transaction:', estimatedPartialFee.toString());
}

// https://substrate.stackexchange.com/questions/2637/determining-the-final-fee-from-a-client/4224#4224
async function getPaymentFee(blockNumber:any,extrinsicHash:string) {
    const extension = await getReefExtension('Minimal DApp Example') as ReefInjected;

    // we can also get provider and signer
    const provider = await extension.reefProvider.getNetworkProvider();

    // const blockNumber =  7874237;
    // const extrinsicHash = '0xa4868192be3b0babd0f4bd396a85b9bcea97adbd80ed05dce02c4c76c422d48a';
    console.log('GET FEE for 📦 block nr=', blockNumber, ' extrinsic hash=', extrinsicHash);
    // Get block hash (if we only have block number)
    const blockHash = await provider.api.rpc.chain.getBlockHash(blockNumber);
    const { block } = await provider.api.rpc.chain.getBlock(blockHash);
    let extrinsicIndex= undefined;
    if(block.extrinsics.length){
        console.log('extrinsic hashes in block ',block.extrinsics.map(ext=>ext.hash.toHuman()))
        extrinsicIndex = block.extrinsics.findIndex(ext => ext.hash.toHuman() === extrinsicHash);
    }
    if (extrinsicIndex == null) {
        console.log('Extrinsic with hash=', extrinsicHash, ' does not exist in block ', blockNumber)
        return;
    }

    const queryInfo = await provider.api.rpc.payment
        .queryInfo(block.extrinsics[extrinsicIndex].toHex(), block.header.parentHash);
    const queryFeeDetails = await provider.api.rpc.payment
        .queryFeeDetails(block.extrinsics[extrinsicIndex].toHex(), block.header.parentHash);

    const baseFee = queryFeeDetails.inclusionFee.isSome 
        ? queryFeeDetails.inclusionFee.unwrap().baseFee.toBigInt() : BigInt(0);
    const lenFee = queryFeeDetails.inclusionFee.isSome 
        ? queryFeeDetails.inclusionFee.unwrap().lenFee.toBigInt() : BigInt(0);
    const adjustedWeightFee = queryFeeDetails.inclusionFee.isSome 
        ? queryFeeDetails.inclusionFee.unwrap().adjustedWeightFee.toBigInt() : BigInt(0);
    const estimatedWeight = queryInfo.weight.toBigInt();
    const estimatedPartialFee = queryInfo.partialFee.toBigInt();
    console.log('estimated partial fee:', estimatedPartialFee.toString());

    const apiAt = await provider.api.at(blockHash);
    const allRecords = await apiAt.query.system.events();
    const successEvent = allRecords.find((event) =>
        event.phase.isApplyExtrinsic &&
        event.phase.asApplyExtrinsic.eq(extrinsicIndex) &&
        provider.api.events.system.ExtrinsicSuccess.is((event as any).event)
    );
    if (!successEvent) {
        console.log('ExtrinsicSuccess event not found');
        return;
    }

    const [dispatchInfo] = successEvent.event.data;
    const dispatchInfoJSON = dispatchInfo.toJSON() as any;
    if (dispatchInfoJSON.paysFee === "No") {
        console.log('actual partial fee:', 0);
        return;
    }
    const actualWeight = BigInt(dispatchInfoJSON.weight);

    const partialFee = baseFee + lenFee + ((adjustedWeightFee / estimatedWeight) * actualWeight)

    console.log('actual partial fee:', partialFee.toString());
}

document.addEventListener('log-block-extrinsics', async (evt: any) => {
    try {
        await logBlockExtrinsicsAndEvents(evt.detail.blockNumber);
    } catch (error) {
        console.log("error===",error);
    }
});

async function logBlockExtrinsicsAndEvents(blockNumber: number) {
    const extension = await getReefExtension('Minimal DApp Example') as ReefInjected;
    const provider = await extension.reefProvider.getNetworkProvider();

    const blockHash = await provider.api.rpc.chain.getBlockHash(blockNumber);
    const { block } = await provider.api.rpc.chain.getBlock(blockHash);
    const events = await provider.api.query.system.events.at(blockHash);

    console.log(`\n📦 Block #${blockNumber} - Hash: ${blockHash.toString()}`);
    block.extrinsics.forEach((extrinsic, index) => {
        console.log(`Extrinsic [${index}]`);
        console.log('Method:', extrinsic.method.method);
        console.log('Section:', extrinsic.method.section);
        console.log('Args:', extrinsic.method.args.map(arg => arg.toString()).join(', '));
        console.log('Signer:', extrinsic.signer?.toString() || 'N/A');
        console.log('Hash:', extrinsic.hash.toHex());

        const relatedEvents = events;

        if (relatedEvents.length) {
            console.log('Events:');
            relatedEvents.forEach(({ event }) => {
                console.log(`- ${event.section}.${event.method}: ${event.data.toString()}`);
            });
        } else {
            console.log('No events found for this extrinsic.');
        }
    });
}
