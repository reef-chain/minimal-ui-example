import 'dotenv/config';
import { WsProvider } from "@polkadot/api";
import { Provider } from "@reef-chain/evm-provider";
import { MnemonicSigner } from "./mnemonicSigner";
import { waitReady } from '@polkadot/wasm-crypto';

// this script should be run with 'npx ts-node ./src/nativeTransaction.ts' since it's meant to be server-side only
// use with caution at your own risk !!!

(async function test() {
    const isReady = await waitReady();
    if (isReady) {
      console.log("WASM initialized");
    } else {
      console.log("Error initializing WASM");
    }
  
    const provider = new Provider({
      provider: new WsProvider("wss://rpc.reefscan.com/ws"),
    });;
    await provider.api.isReadyOrError;
  
    const mnemonic = process.env.MNEMONIC;
    const amount = BigInt(process.env.AMOUNT);
    const recipient = process.env.RECIPIENT;

    const signingKey = new MnemonicSigner(mnemonic);

    const sender = await signingKey.getAddress();
  
    const transfer = await provider.api.tx.balances
      .transfer(recipient, amount)
      .signAsync(sender, { signer: signingKey });
  
    console.log("🌟RUN THE FOLLOWING COMMAND:\n")
  
    console.log(`curl -H "Content-Type: application/json" -d '{
        "id": 1,
        "jsonrpc": "2.0",
        "method": "author_submitExtrinsic",
        "params": ["${transfer.toHex()}"]
      }' https://rpc.reefscan.com
      `);

      process.exit(0);
  })();