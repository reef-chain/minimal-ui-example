<img src="https://i.imgur.com/DTv57Sk.png" width="120" alt="Reef" align="right">

# Reef Minimal Ui Example

Very basic example to interact with Reef Chain and to trigger Reef Browser Extension.

## Setting up Dev / Installing / Getting started

Here's a brief intro about what a developer must do in order to start developing
the project further:

```shell
git clone https://github.com/reef-defi/minimal-ui-example
cd minimal-ui-example/
yarn install
yarn serve
```

## Making Native Transaction using cURL

You can make a native transaction on Reef Chain using CLI

Make `.env` file

```bash
cp .env.sample .env
```

Replace `XXXX` with the respective values of 
- `MNEMONIC` : Mnemonics of the source account
- `RECIPIENT` :  Destination wallet address (NATIVE ADDRESS) [should start with 5....]
- `AMOUNT` : Amount in REEFs ex: `1000000000000000000 = 1REEF`

```bash
yarn sign-native-tx
```

The output of the above command will be similar to:

```bash
curl -H "Content-Type: application/json" -d '{
        "id": 1,
        "jsonrpc": "2.0",
        "method": "author_submitExtrinsic",
        "params": ["0x....."]
      }' https://rpc.reefscan.com
```

paste this in terminal to make the transaction using cURL.

## Get block events using cURL

```bash
curl -X POST https://rpc.reefscan.com \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "jsonrpc": "2.0",
    "method": "state_getStorageAt",
    "params": [
      "0x26aa394eea5630e07c48ae0c9558cef780d41e5e16056765bc8461851072c9d7",
      "0x[BLOCK_HASH]" // REPLACE THIS WITH BLOCK HASH
    ]
  }'
```

The response should look like this

```bash
{"jsonrpc":"2.0","result":"0x1c00000000000000585f8f090000000002000000010000000004c09bab4e1d753a158ef47e8fb0b9ca903427cc673fa185c1b172c069a3b92239000001000000000324cf38208932b4e1fe10b397e547d5c7fd4d5bb5f3ebfd39a1b330c97bfdac46000001000000060024cf38208932b4e1fe10b397e547d5c7fd4d5bb5f3ebfd39a1b330c97bfdac46d8db082617ef642cd2000000000000000000010000000601c09bab4e1d753a158ef47e8fb0b9ca903427cc673fa185c1b172c069a3b9223900407a10f35a000000000000000000000000010000000602c09bab4e1d753a158ef47e8fb0b9ca903427cc673fa185c1b172c069a3b9223924cf38208932b4e1fe10b397e547d5c7fd4d5bb5f3ebfd39a1b330c97bfdac46d8db082617ef642cd2000000000000000000010000000000c879c10b00000000000000","id":1}
```

The result is SCALE coded, you can decode it using this

```js

  const hex = <RESULT_HEX>;
  const events = provider.api.createType('Vec<EventRecord>', hex);

  events.forEach(({ event, phase }, i) => {
    const { section, method, data } = event;
    console.log(`#${i} ➜ [${section}.${method}] @ phase ${phase.toString()}`);
    console.log(`    Data: ${data.toString()}`);
  });
```


## Licensing
Licensed under the MIT license.
