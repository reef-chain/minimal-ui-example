import { Signer as SignerInterface, SignerResult } from "@polkadot/api/types";
import { u8aToHex, u8aWrapBytes } from "@polkadot/util";
import { TypeRegistry } from '@polkadot/types';
import { KeyringPair } from '@polkadot/keyring/types';
import type { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';
import { KeypairType } from "@polkadot/util-crypto/types";
import { Keyring as ReefKeyring } from "@polkadot/keyring";
import { decodeAddress, deriveAddress, signatureVerify } from "@polkadot/util-crypto";

const CRYPTO_TYPE: KeypairType = "sr25519";
const SS58_FORMAT = 42;
const keyring = new ReefKeyring({ type: CRYPTO_TYPE, ss58Format: SS58_FORMAT });

async function keyPairFromMnemonic(mnemonic: string): Promise<KeyringPair | null> {
    try {
        return keyring.addFromMnemonic(mnemonic, {}, CRYPTO_TYPE);
    } catch (err) {
        console.log("error in keyPairFromMnemonic", err);
        return null;
    }
}

export class MnemonicSigner implements SignerInterface {
    mnemonic: string;
    private nextId = 0;

    constructor(mnemonic: string) {
        this.mnemonic = mnemonic;
    }

    async signPayload(payload: SignerPayloadJSON): Promise<SignerResult> {
        const registry = new TypeRegistry();
        registry.setSignedExtensions(payload.signedExtensions);

        const pair: KeyringPair | null = await keyPairFromMnemonic(this.mnemonic);

        return {
            id: ++this.nextId,
            ...registry
                .createType('ExtrinsicPayload', payload, { version: payload.version })
                .sign(pair!)
        } as SignerResult;
    }

    async signRaw(payloadRaw: SignerPayloadRaw): Promise<SignerResult> {
        const pair: KeyringPair | null = await keyPairFromMnemonic(this.mnemonic);
        if (pair!.address === payloadRaw.address) {

        }
        return { id: ++this.nextId, signature: u8aToHex(pair!.sign(u8aWrapBytes(payloadRaw.data))) };
    }

    isValidSignature(signedMessage: any, signature: any, address: any) {
        const publicKey = decodeAddress(address);
        const hexPublicKey = u8aToHex(publicKey);

        return signatureVerify(signedMessage, signature, hexPublicKey).isValid;
    };

    async getAddress(): Promise<string | null> {
        const pair = await keyPairFromMnemonic(this.mnemonic);
        if (!pair) return null;
        return pair.address;
    }

}