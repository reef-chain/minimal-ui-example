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

## Licensing
Licensed under the MIT license.
