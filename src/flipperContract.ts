import {Signer as EthersSigner} from "@ethersproject/abstract-signer";
import {ethers} from "ethers";
import {Signer as EvmSigner} from "@reef-defi/evm-provider/Signer";
import {isMainnet} from "@reef-defi/evm-provider/utils";

export function getFlipperContract(signer: EvmSigner) {
    if (isMainnet(signer)) {
        throw new Error('Please connect to testnet');
    }
    const flipperContractAddressTestnet = '0x3bb302b1f0dCaFFB87017A7E7816cdB8C5ec710D';
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
