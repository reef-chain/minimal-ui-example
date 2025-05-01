import { extension as reefExt } from "@reef-chain/util-lib";

export async function getReefExtension(appName:string) {
    const extensionsArr = await reefExt.web3Enable(appName);
    const extension = extensionsArr.find(e=>e.name===reefExt.REEF_EXTENSION_IDENT);
    if (!extension) {
        throw new Error('Install Reef Chain Wallet extension for Chrome or Firefox. See docs.reef.io');
    }
    console.log("Extension=", extension);
    return extension as reefExt.ReefInjected;
}
