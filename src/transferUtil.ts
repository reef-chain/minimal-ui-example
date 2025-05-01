import {Signer} from "@reef-chain/evm-provider";
import {transactionUtils} from "@reef-chain/util-lib";
import {Contract} from "ethers";
import {Observable} from "rxjs";
import {initProvider} from "./providerUtil";
import { extension as reefExt } from "@reef-chain/util-lib";
import { TransactionStatusEvent } from "@reef-chain/util-lib/dist/dts/transaction";

const ERC20_TRANSFER_ABI = [{
    inputs: [
        { name: 'recipient', type: 'address' },
        { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
}];

const STORAGE_LIMIT = 2000;

export async function sendNativeREEFTransfer (amount: string, fromSigner: Signer, toAddress: string): Promise<void>{
    await transactionUtils.nativeTransferSigner$(amount, fromSigner, toAddress).subscribe((val: any) => {
        console.log('NATIVE TX STATUS=', val)
    }, (err) => console.log('TRANSACTION ERR=', err));
}

export  function sendERC20Transfer (amount: string, fromSigner: Signer, toAddress: string, contractAddress: string): Observable<TransactionStatusEvent>{
    // @ts-ignore
    let tContract=new Contract(contractAddress, ERC20_TRANSFER_ABI, fromSigner);
    // @ts-ignore
    return transactionUtils.reef20Transfer$(toAddress, fromSigner.provider, amount, tContract);
}

export async function completeTransferExample(amount: string, toAddress: string, contractAddress: string): Promise<any>{
    const extensionsArr = await reefExt.web3Enable('Test Transfer');
    const extension = extensionsArr.find(e=>e.name===reefExt.REEF_EXTENSION_IDENT);
    const provider = await initProvider('wss://rpc.reefscan.info/ws');
    const accs=await extension.accounts.get();
    const fromAddr = accs[0].address;
    const signer = new Signer(provider, fromAddr, extension.signer);
    // @ts-ignore
    const tokenContract = new Contract(contractAddress, ERC20_TRANSFER_ABI, signer);
    console.log('completeTransferExample from=', fromAddr, ' to=', toAddress, ' contract=', contractAddress);

    return tokenContract.transfer(toAddress, amount, {
        customData: {
            storageLimit: STORAGE_LIMIT
        }
    }).then((tx)=>{
        console.log('tx ', tx)
        return tx.wait()
    }).then((txRec)=>{
        console.log('tx receipt', txRec)
        return txRec;
    });
}
