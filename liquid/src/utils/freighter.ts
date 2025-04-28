import {
  requestAccess,
  signTransaction,
  setAllowed,
} from "@stellar/freighter-api";

async function checkConnection() {
  const isAllowed = await setAllowed();
  if (isAllowed) {
    return isAllowed;
  }
}

const retrievePublicKey = async () => {
  let publicKey: string | { address: string; error?: any } = "";
  let error = "";
  try {
    const response = await requestAccess();
    publicKey = typeof response === 'string' ? response : response.address;
  } catch (e) {
    error = e as string;
  }
  if (error) {
    return error;
  }
  return publicKey;
};

const userSignTransaction = async (xdr: string, network: string, signWith: string) => {
  let signedTransaction: string | { signedTxXdr: string; signerAddress: string; error?: any } = "";
  let error = "";

  try {
    signedTransaction = await signTransaction(xdr, {
      networkPassphrase: network,
      address: signWith,
    });
    
    // If signedTransaction is an object with signedTxXdr property, return that
    if (typeof signedTransaction === 'object' && signedTransaction.signedTxXdr) {
      return signedTransaction.signedTxXdr;
    }
  } catch (e) {
    error = e as string;
  }

  if (error) {
    return error;
  }

  return signedTransaction;
};

export { checkConnection, retrievePublicKey, userSignTransaction };