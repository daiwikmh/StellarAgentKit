import {
    StellarWalletsKit,
    WalletNetwork,
    allowAllModules,
    FREIGHTER_ID,
    ISupportedWallet,
} from '@creit.tech/stellar-wallets-kit';

const SELECTED_WALLET_ID = "selectedWalletId";

export function getSelectedWalletId() {
    return localStorage.getItem(SELECTED_WALLET_ID);
}

export const kit: StellarWalletsKit = new StellarWalletsKit({
    network: WalletNetwork.TESTNET,
    selectedWalletId: getSelectedWalletId() ?? FREIGHTER_ID,
    modules: allowAllModules(),
});


export async function getPublicKey() {
    if (!getSelectedWalletId()) return null;
    const { address } = await kit.getAddress();
    return address;
}

export async function setWallet(walletId: string) {
    localStorage.setItem(SELECTED_WALLET_ID, walletId);
    kit.setWallet(walletId);
}

export async function disconnect(callback?: () => Promise<void>) {
    localStorage.removeItem(SELECTED_WALLET_ID);
    await kit.disconnect();
    if (callback) await callback();
}

export async function connect(callback?: () => Promise<void>) {
    await kit.openModal({
        onWalletSelected: async (option) => {
            try {
                await setWallet(option.id);
                if (callback) await callback();
            } catch (e) {
                console.error(e);
            }
            return option.id;
        },
    });
}

export async function signTransaction(
    xdr: string,
    opts?: {
        networkPassphrase?: string;
        address?: string;
        path?: string;
        submit?: boolean;
        submitUrl?: string;
    }
) {
    return kit.signTransaction(xdr, opts);
}

export async function signAuthEntry(
    authEntry: string,
    opts?: {
        networkPassphrase?: string;
        address?: string;
        path?: string;
    }
) {
    return kit.signAuthEntry(authEntry, opts);
}

export async function signMessage(
    message: string,
    opts?: {
        networkPassphrase?: string;
        address?: string;
        path?: string;
    }
) {
    return kit.signMessage(message, opts);
}

export async function getSupportedWallets(): Promise<ISupportedWallet[]> {
    return kit.getSupportedWallets();
}

export async function getNetwork() {
    return kit.getNetwork();
}

export function isButtonCreated(): boolean {
    return kit.isButtonCreated();
}

export async function assignButtons(params: {
    connectEl: HTMLElement | string;
    disconnectEl?: HTMLElement | string;
    onConnect: (response: { address: string }) => void;
    onDisconnect: () => void;
}) {
    return kit.assignButtons(params);
}

export async function createButton(params: {
    container: HTMLElement;
    onConnect: (response: { address: string }) => void;
    onClosed?: (err: Error) => void;
    onError?: (err: Error) => void;
    onDisconnect: () => void;
    horizonUrl?: string;
    buttonText?: string;
}) {
    return kit.createButton(params);
}

export async function removeButton(params?: { skipDisconnect?: boolean }) {
    return kit.removeButton(params);
}

export async function openModal(params: {
    onWalletSelected: (option: ISupportedWallet) => void;
    onClosed?: (err: Error) => void;
    modalTitle?: string;
    notAvailableText?: string;
}) {
    return kit.openModal(params);
}