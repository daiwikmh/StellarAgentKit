import {
    Contract,
    SorobanRpc,
    TransactionBuilder,
    nativeToScVal,
    scValToNative,
    xdr,
    Networks,
    BASE_FEE,
    Address,
  } from "@stellar/stellar-sdk";
  import { signTransaction } from "@/lib/stellar";
  
  // Configuration
  const rpcUrl = "https://soroban-testnet.stellar.org";
  const contractAddress = "CAVLP5DH2GJPZMVO7IJY4CVOD5MWEFTJFVPD2YY2FQXOQHRGHK4D6HLP";
  const networkPassphrase = Networks.TESTNET;
  
  // Types
  export interface Asset {
    type: "native" | "alphanum4" | "alphanum12";
    code?: string;
    issuer?: string;
  }
  
  export interface PriceData {
    price: bigint;
    timestamp: bigint;
  }
  export interface ConfigData {
    admin: string;
    base_asset: Asset;
    decimals: number;
    resolution: number;
    period: number;
    assets: Asset[];
  }
  
  // Utility functions for ScVal conversion
  // const addressToScVal = (address: string): xdr.ScVal => {
  //   if (!address.match(/^[CG][A-Z0-9]{55}$/)) {
  //     throw new Error(`Invalid address format: ${address}`);
  //   }
  //   return nativeToScVal(new Address(address), { type: "address" });
  // };
  
  const numberToU32 = (value: number): xdr.ScVal => {
    if (!Number.isInteger(value) || value < 0 || value > 4294967295) {
      throw new Error(`Invalid u32 value: ${value}`);
    }
    return nativeToScVal(value, { type: "u32" });
  };
  
  const numberToI128 = (value: string | bigint): xdr.ScVal => {
    return nativeToScVal(typeof value === "string" ? BigInt(value) : value, { type: "i128" });
  };
  
  const numberToU64 = (value: string | bigint): xdr.ScVal => {
    return nativeToScVal(typeof value === "string" ? BigInt(value) : value, { type: "u64" });
  };
  
  const assetToScVal = (asset: Asset): xdr.ScVal => {
    if (asset.type === "native") {
      return xdr.ScVal.scvSymbol("native");
    }
    if (!asset.code || !asset.issuer) {
      throw new Error(`Asset code and issuer required for ${asset.type}`);
    }
    const assetObj = {
      code: asset.code,
      issuer: new Address(asset.issuer),
    };
    return nativeToScVal(
      assetObj,
      { type: asset.type === "alphanum4" ? "asset_alphanum4" : "asset_alphanum12" }
    );
  };
  
  const vecToScVal = (items: any[], type: string): xdr.ScVal => {
    return nativeToScVal(items, { type: `vec<${type}>` });
  };
  
  const configDataToScVal = (config: ConfigData): xdr.ScVal => {
    const structObj = {
      admin: new Address(config.admin),
      base_asset: assetToScVal(config.base_asset),
      decimals: config.decimals,
      resolution: config.resolution,
      period: BigInt(config.period),
      assets: vecToScVal(config.assets, "asset"),
    };
    return nativeToScVal(structObj, { type: "struct" });
  };
  
  const bytesN32ToScVal = (hash: string): xdr.ScVal => {
    if (!hash.match(/^[0-9a-fA-F]{64}$/)) {
      throw new Error(`Invalid BytesN<32> hash: ${hash}`);
    }
    return nativeToScVal(Buffer.from(hash, "hex"), { type: "bytes_n<32>" });
  };

  const parseContractAsset = (tuple: [string, string]): Asset => {
    console.log("Parsing tuple:", tuple);
    // Assuming "Stellar" indicates native XLM
    if (tuple[0] === "Stellar") {
      const asset = { type: "native" } as Asset;
      console.log("Parsed asset:", asset);
      return asset;
    }
    // For non-native assets, treat tuple[0] as code and tuple[1] as issuer
    const asset = {
      type: "alphanum4", // Default, adjust if contract specifies
      code: tuple[0],
      issuer: tuple[1],
    } as Asset;
    console.log("Parsed asset:", asset);
    return asset;
  };
  
  // Core contract interaction function
  const contractInt = async (caller: string, functName: string, values: xdr.ScVal[] | xdr.ScVal | null = null) => {
    try {
      const server = new SorobanRpc.Server(rpcUrl, { allowHttp: true });
      const sourceAccount = await server.getAccount(caller).catch((err) => {
        throw new Error(`Failed to fetch account ${caller}: ${err.message}`);
      });
  
      const contract = new Contract(contractAddress);
      const params = {
        fee: BASE_FEE,
        networkPassphrase,
      };
  
      // Build transaction
      const builder = new TransactionBuilder(sourceAccount, params);
      let transaction;
      if (values == null) {
        transaction = builder.addOperation(contract.call(functName)).setTimeout(300).build();
      } else if (Array.isArray(values)) {
        transaction = builder.addOperation(contract.call(functName, ...values)).setTimeout(300).build();
      } else {
        transaction = builder.addOperation(contract.call(functName, values)).setTimeout(300).build();
      }
  
      // Simulate transaction for read-only calls
      const simulation = await server.simulateTransaction(transaction).catch((err) => {
        console.error(`Simulation failed for ${functName}: ${err.message}`);
        throw new Error(`Failed to simulate transaction: ${err.message}`);
      });
  
      console.log(`Simulation response for ${functName}:`, JSON.stringify(simulation, null, 2));
  
      // Handle simulation response for read-only calls
      if ("results" in simulation && Array.isArray(simulation.results) && simulation.results.length > 0) {
        console.log(`Read-only call detected for ${functName}`);
        const result = simulation.results[0];
        if (result.xdr) {
          try {
            const scVal = xdr.ScVal.fromXDR(result.xdr, "base64");
            const parsedValue = scValToNative(scVal);
            console.log(`Parsed simulation result for ${functName}:`, parsedValue);
            return parsedValue;
          } catch (err) {
            console.error(`Failed to parse XDR for ${functName}:`, err);
            throw new Error(`Failed to parse simulation result: ${err instanceof Error ? err.message : String(err)}`);
          }
        }
        console.error(`No xdr field in simulation results[0] for ${functName}:`, result);
        throw new Error("No return value in simulation results");
      } else if ("error" in simulation) {
        console.error(`Simulation error for ${functName}:`, simulation.error);
        throw new Error(`Simulation failed: ${simulation.error}`);
      }
  
      // For state-changing calls, prepare and submit transaction
      console.log(`Submitting transaction for ${functName}`);
      const preparedTx = await server.prepareTransaction(transaction).catch((err) => {
        console.error(`Prepare transaction failed for ${functName}: ${err.message}`);
        throw new Error(`Failed to prepare transaction: ${err.message}`);
      });
      const prepareTxXDR = preparedTx.toXDR();
  
      const signedTxResponse = await signTransaction(prepareTxXDR, {
        networkPassphrase,
      }).catch((err) => {
        console.error(`Sign transaction failed for ${functName}: ${err.message}`);
        throw new Error(`Failed to sign transaction: ${err.message}`);
      });
  
      const signedXDR = typeof signedTxResponse === "string" ? signedTxResponse : signedTxResponse.signedTxXdr;
      const tx = TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET);
      const txResult = await server.sendTransaction(tx).catch((err) => {
        console.error(`Send transaction failed for ${functName}: ${err.message}`);
        throw new Error(`Send transaction failed: ${err.message}`);
      });
  
      let txResponse = await server.getTransaction(txResult.hash);
      const maxRetries = 30;
      let retries = 0;
  
      while (txResponse.status === "NOT_FOUND" && retries < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        txResponse = await server.getTransaction(txResult.hash);
        retries++;
      }
  
      if (txResponse.status !== "SUCCESS") {
        console.error(`Transaction failed for ${functName} with status: ${txResponse.status}`, JSON.stringify(txResponse, null, 2));
        throw new Error(`Transaction failed with status: ${txResponse.status}`);
      }
  
      // Parse return value if present
      if (txResponse.returnValue) {
        try {
          const parsedValue = scValToNative(txResponse.returnValue);
          console.log(`Parsed transaction result for ${functName}:`, parsedValue);
          return parsedValue;
        } catch (err) {
          console.error(`Failed to parse transaction return value for ${functName}:`, err);
          throw new Error(`Failed to parse transaction result: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
  
      return null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error in contract interaction (${functName}):`, errorMessage);
      throw error;
    }
  };
  
  // Contract interaction functions
  export async function base(caller: string): Promise<Asset | null> {
    try {
      const result = await contractInt(caller, "base", null);
      console.log("Base asset:", result);
      return result as Asset | null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to get base asset:", errorMessage);
      throw error;
    }
  }
  
  export async function decimals(caller: string): Promise<number | null> {
    try {
      const result = await contractInt(caller, "decimals", null);
      console.log("Decimals:", result);
      return result as number | null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to get decimals:", errorMessage);
      throw error;
    }
  }
  
  export async function resolution(caller: string): Promise<number | null> {
    try {
      const result = await contractInt(caller, "resolution", null);
      console.log("Resolution:", result);
      return result as number | null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to get resolution:", errorMessage);
      throw error;
    }
  }
  
  export async function period(caller: string): Promise<bigint | null> {
    try {
      const result = await contractInt(caller, "period", null);
      console.log("Period:", result);
      return result ? BigInt(result) : null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to get period:", errorMessage);
      throw error;
    }
  }
  
  export async function assets(caller: string): Promise<Asset[] | null> {
    try {
      const result = await contractInt(caller, "assets", null);
      console.log("Raw assets result:", result);
      if (!result) return null;
      // Ensure result is an array of tuples
      if (!Array.isArray(result)) {
        console.error("Expected array of tuples, got:", result);
        throw new Error("Invalid assets format: expected array of tuples");
      }
      // Parse array of ["Stellar", Address] tuples to Asset[]
      // Parse array of ["Stellar", Address] tuples to Asset[]
    const parsedAssets = result.map((tuple: [string, string], index: number) => {
      console.log(`Parsing tuple at index ${index}:`, tuple);
      return parseContractAsset(tuple);
    });
    console.log("Parsed assets:", parsedAssets);
    return parsedAssets;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to get assets:", errorMessage);
    throw error;
  }
}
  
  export async function lastTimestamp(caller: string): Promise<bigint | null> {
    try {
      const result = await contractInt(caller, "last_timestamp", null);
      console.log("Last timestamp:", result);
      return result ? BigInt(result) : null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to get last timestamp:", errorMessage);
      throw error;
    }
  }
  
  export async function price(caller: string, asset: Asset, timestamp: string): Promise<PriceData | null> {
    try {
      const assetScVal = assetToScVal(asset);
      const timestampScVal = numberToU64(timestamp);
      const result = await contractInt(caller, "price", [assetScVal, timestampScVal]);
      console.log("Price:", result);
      return result ? { price: BigInt(result.price), timestamp: BigInt(result.timestamp) } : null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to get price:", errorMessage);
      throw error;
    }
  }
  
  export async function lastPrice(caller: string, asset: Asset): Promise<PriceData | null> {
    try {
      const assetScVal = assetToScVal(asset);
      const result = await contractInt(caller, "lastprice", [assetScVal]);
      console.log("Last price:", result);
      return result ? { price: BigInt(result.price), timestamp: BigInt(result.timestamp) } : null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to get last price:", errorMessage);
      throw error;
    }
  }
  
  export async function prices(caller: string, asset: Asset, records: number): Promise<PriceData[] | null> {
    try {
      const assetScVal = assetToScVal(asset);
      const recordsScVal = numberToU32(records);
      const result = await contractInt(caller, "prices", [assetScVal, recordsScVal]);
      console.log("Prices:", result);
      return result
        ? result.map((data: any) => ({
            price: BigInt(data.price),
            timestamp: BigInt(data.timestamp),
          }))
        : null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to get prices:", errorMessage);
      throw error;
    }
  }
  
  export async function xLastPrice(caller: string, baseAsset: Asset, quoteAsset: Asset): Promise<PriceData | null> {
    try {
      const baseAssetScVal = assetToScVal(baseAsset);
      const quoteAssetScVal = assetToScVal(quoteAsset);
      const result = await contractInt(caller, "x_last_price", [baseAssetScVal, quoteAssetScVal]);
      console.log("Cross last price:", result);
      return result ? { price: BigInt(result.price), timestamp: BigInt(result.timestamp) } : null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to get cross last price:", errorMessage);
      throw error;
    }
  }
  
  export async function xPrice(caller: string, baseAsset: Asset, quoteAsset: Asset, timestamp: string): Promise<PriceData | null> {
    try {
      const baseAssetScVal = assetToScVal(baseAsset);
      const quoteAssetScVal = assetToScVal(quoteAsset);
      const timestampScVal = numberToU64(timestamp);
      const result = await contractInt(caller, "x_price", [baseAssetScVal, quoteAssetScVal, timestampScVal]);
      console.log("Cross price:", result);
      return result ? { price: BigInt(result.price), timestamp: BigInt(result.timestamp) } : null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to get cross price:", errorMessage);
      throw error;
    }
  }
  
  export async function xPrices(caller: string, baseAsset: Asset, quoteAsset: Asset, records: number): Promise<PriceData[] | null> {
    try {
      const baseAssetScVal = assetToScVal(baseAsset);
      const quoteAssetScVal = assetToScVal(quoteAsset);
      const recordsScVal = numberToU32(records);
      const result = await contractInt(caller, "x_prices", [baseAssetScVal, quoteAssetScVal, recordsScVal]);
      console.log("Cross prices:", result);
      return result
        ? result.map((data: any) => ({
            price: BigInt(data.price),
            timestamp: BigInt(data.timestamp),
          }))
        : null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to get cross prices:", errorMessage);
      throw error;
    }
  }
  
  export async function twap(caller: string, asset: Asset, records: number): Promise<bigint | null> {
    try {
      const assetScVal = assetToScVal(asset);
      const recordsScVal = numberToU32(records);
      const result = await contractInt(caller, "twap", [assetScVal, recordsScVal]);
      console.log("TWAP:", result);
      return result ? BigInt(result) : null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to get TWAP:", errorMessage);
      throw error;
    }
  }
  
  export async function xTwap(caller: string, baseAsset: Asset, quoteAsset: Asset, records: number): Promise<bigint | null> {
    try {
      const baseAssetScVal = assetToScVal(baseAsset);
      const quoteAssetScVal = assetToScVal(quoteAsset);
      const recordsScVal = numberToU32(records);
      const result = await contractInt(caller, "x_twap", [baseAssetScVal, quoteAssetScVal, recordsScVal]);
      console.log("Cross TWAP:", result);
      return result ? BigInt(result) : null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to get cross TWAP:", errorMessage);
      throw error;
    }
  }
  
  export async function version(caller: string): Promise<number | null> {
    try {
      const result = await contractInt(caller, "version", null);
      console.log("Version:", result);
      return result as number | null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to get version:", errorMessage);
      throw error;
    }
  }
  
  export async function admin(caller: string): Promise<string | null> {
    try {
      const result = await contractInt(caller, "admin", null);
      console.log("Admin:", result);
      return result as string | null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to get admin:", errorMessage);
      throw error;
    }
  }
  
  export async function config(caller: string, configData: ConfigData): Promise<void> {
    try {
      const configScVal = configDataToScVal(configData);
      await contractInt(caller, "config", [configScVal]);
      console.log("Config set successfully");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to set config:", errorMessage);
      throw error;
    }
  }
  
  export async function addAssets(caller: string, assets: Asset[]): Promise<void> {
    try {
      const assetsScVal = vecToScVal(assets.map(assetToScVal), "asset");
      await contractInt(caller, "add_assets", [assetsScVal]);
      console.log("Assets added successfully");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to add assets:", errorMessage);
      throw error;
    }
  }
  
  export async function setPeriod(caller: string, period: string): Promise<void> {
    try {
      const periodScVal = numberToU64(period);
      await contractInt(caller, "set_period", [periodScVal]);
      console.log("Period set successfully");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to set period:", errorMessage);
      throw error;
    }
  }
  
  export async function setPrice(caller: string, updates: string[], timestamp: string): Promise<void> {
    try {
      const updatesScVal = vecToScVal(updates.map((price) => numberToI128(price)), "i128");
      const timestampScVal = numberToU64(timestamp);
      await contractInt(caller, "set_price", [updatesScVal, timestampScVal]);
      console.log("Price set successfully");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to set price:", errorMessage);
      throw error;
    }
  }
  
  export async function updateContract(caller: string, wasmHash: string): Promise<void> {
    try {
      const wasmHashScVal = bytesN32ToScVal(wasmHash);
      await contractInt(caller, "update_contract", [wasmHashScVal]);
      console.log("Contract updated successfully");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to update contract:", errorMessage);
      throw error;
    }
  }