import {Signer as EthersSigner} from "@ethersproject/abstract-signer";
import {ethers} from "ethers";
import {Signer as EvmSigner} from "@reef-chain/evm-provider";
// import {isMainnet} from "@reef-chain/evm-provider/utils";

export function getFlipperContract(signer: EvmSigner) {
    //using mainnet only for now @anukulpandey
    // if (isMainnet(signer)) {
    //     throw new Error('Please connect to testnet');
    // }

    // const flipperContractAddressTestnet = '0x6bECC47323fcD240F1c856ab3Aa4EFeC5ad63aFE'; //TESTNET CONTRACT ADDRESS

    // MAINNET CONTRACT ADDRESS
    const flipperContractAddressTestnet = '0x62dC5b4eDc7a54d21BFdc5162ef5De6C5aF792Ff';

    const FlipperAbi = [
        {
            inputs: [
                {
                    internalType: 'bool',
                    name: 'initvalue',
                    type: 'bool'
                }
            ],
            stateMutability: 'nonpayable',
            type: 'constructor'
        },
        {
            inputs: [],
            name: 'flip',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function'
        },
        {
            inputs: [],
            name: 'get',
            outputs: [
                {
                    internalType: 'bool',
                    name: '',
                    type: 'bool'
                }
            ],
            stateMutability: 'view',
            type: 'function'
        }
    ];
    //@ts-ignore
    return new ethers.Contract(flipperContractAddressTestnet, FlipperAbi, signer as EthersSigner);
}

export async function flipIt(signer: EvmSigner) {
    const flipperContract = getFlipperContract(signer);
    return  await flipperContract.flip();
}

export async function getFlipperValue(signer: EvmSigner) {
    const flipperContract = getFlipperContract(signer);
    return await flipperContract.get();
}
