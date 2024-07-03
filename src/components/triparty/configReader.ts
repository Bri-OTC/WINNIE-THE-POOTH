import { Asset, Row } from "./config";

interface SymphonyJSON {
  assets: Asset[];
}

async function processSymphonyJSON(): Promise<Asset[]> {
  const response = await fetch("/symphony.json");
  const jsonData: SymphonyJSON = await response.json();
  return jsonData.assets;
}

let symbolList: Asset[] = [];

async function initializeSymbolList() {
  symbolList = await processSymphonyJSON();
}

function getFieldFromAsset(
  broker: string,
  proxyTicker: string,
  side: string,
  leverage: number,
  notional: number
): Row | undefined {
  //console.log(broker, proxyTicker, side, leverage, notional);

  const asset = symbolList.find((a) => a.proxyTicker === proxyTicker);
  //console.log(asset);
  if (asset) {
    const row = asset.notional?.find(
      (r) =>
        r.side === side &&
        r.leverage === leverage &&
        (r.maxNotional ?? Infinity) > notional
    );

    return row;
  }
  return undefined;
}

export function getProxyTicker(mt5Ticker: string) {
  if (!Array.isArray(symbolList) || symbolList.length === 0) {
    initializeSymbolList();
  }
  const asset = symbolList.find((a) => a.mt5Ticker === mt5Ticker);
  if (asset) {
    return asset.proxyTicker;
  }
  return undefined;
}

function findAssetByProxyTicker(proxyTicker: string): Asset | undefined {
  return symbolList.find((a) => a.proxyTicker === proxyTicker);
}

function getAllProxyTickers(): string[] {
  if (!Array.isArray(symbolList)) {
    throw new Error("symbolList is not an array");
  }
  return symbolList.map((a) => a.proxyTicker);
}

function getMaxNotionalForMaxLeverage(
  proxyTicker: string,
  side: string,
  maxLeverage: number
): number | undefined {
  const asset = findAssetByProxyTicker(proxyTicker);
  if (asset) {
    const rows = asset.notional?.filter(
      (r) => r.side === side && r.leverage <= maxLeverage - 1
    );
    if (rows && rows.length > 0) {
      const maxNotionalRow = rows.reduce((prev, current) =>
        (prev.maxNotional ?? 0) > (current.maxNotional ?? 0) ? prev : current
      );
      return maxNotionalRow.maxNotional;
    }
  }
  return undefined;
}

function adjustQuantities(
  bid: number,
  ask: number,
  sQuantity: number,
  lQuantity: number,
  assetAId: string,
  assetBId: string,
  maxLeverage: number
): { sQuantity: number; lQuantity: number } {
  const maxNotionalLongA = getMaxNotionalForMaxLeverage(
    assetAId,
    "long",
    maxLeverage
  );
  const maxNotionalLongB = getMaxNotionalForMaxLeverage(
    assetBId,
    "short",
    maxLeverage
  );
  const maxNotionalShortB = getMaxNotionalForMaxLeverage(
    assetBId,
    "long",
    maxLeverage
  );
  const maxNotionalShortA = getMaxNotionalForMaxLeverage(
    assetAId,
    "short",
    maxLeverage
  );

  if (maxNotionalLongA !== undefined && maxNotionalLongB !== undefined) {
    const maxBidNotional = Math.max(bid) * sQuantity;
    const minMaxNotionalLong = Math.min(maxNotionalLongA, maxNotionalLongB);
    if (maxBidNotional > minMaxNotionalLong) {
      sQuantity = minMaxNotionalLong / bid;
    }
  }

  if (maxNotionalShortA !== undefined && maxNotionalShortB !== undefined) {
    const maxAskNotional = Math.max(ask) * lQuantity;
    const minMaxNotionalShort = Math.min(maxNotionalShortA, maxNotionalShortB);
    if (maxAskNotional > minMaxNotionalShort) {
      lQuantity = minMaxNotionalShort / ask;
    }
  }

  return { sQuantity, lQuantity };
}

async function getPairConfig(
  tickerA: string,
  tickerB: string,
  side: string,
  leverage: number,
  notional: number
): Promise<Row> {
  //console.log(tickerA, tickerB, side, leverage, notional);
  if (Object.keys(symbolList).length === 0) {
    await initializeSymbolList();
  }

  const rowA = getFieldFromAsset(
    "mt5.ICMarkets",
    tickerA,
    side,
    leverage,
    notional
  );

  const rowB = getFieldFromAsset(
    "mt5.ICMarkets",
    tickerB,
    side === "long" ? "short" : "long",
    leverage,
    notional
  );

  if (!rowA || !rowB) {
    throw new Error(
      "Notional row not found for the specified side and leverage"
    );
  }

  const config: Row = {
    side: side,
    leverage: leverage,
    maxNotional: Math.min(
      rowA.maxNotional ?? Infinity,
      rowB.maxNotional ?? Infinity
    ),
    minAmount: Math.max(rowA.minAmount ?? 0, rowB.minAmount ?? 0),
    maxAmount: Math.min(rowA.maxAmount ?? Infinity, rowB.maxAmount ?? Infinity),
    precision: Math.min(rowA.precision ?? Infinity, rowB.precision ?? Infinity),
    maxLeverageDeltaGlobalNotional: Math.min(
      rowA.maxLeverageDeltaGlobalNotional ?? Infinity,
      rowB.maxLeverageDeltaGlobalNotional ?? Infinity
    ),
    maxLeverageLongGlobalNotional: Math.min(
      rowA.maxLeverageLongGlobalNotional ?? Infinity,
      rowB.maxLeverageLongGlobalNotional ?? Infinity
    ),
    maxLeverageShortGlobalNotional: Math.min(
      rowA.maxLeverageShortGlobalNotional ?? Infinity,
      rowB.maxLeverageShortGlobalNotional ?? Infinity
    ),
    imA: Math.max(rowA.imA ?? 0, rowB.imA ?? 0),
    imB: Math.max(rowA.imB ?? 0, rowB.imB ?? 0),
    dfA: Math.max(rowA.dfA ?? 0, rowB.dfA ?? 0),
    dfB: Math.max(rowA.dfB ?? 0, rowB.dfB ?? 0),
    ir: Math.max(rowA.ir ?? 0, rowB.ir ?? 0),
    expiryA: Math.max(rowA.expiryA ?? 0, rowB.expiryA ?? 0),
    expiryB: Math.max(rowA.expiryB ?? 0, rowB.expiryB ?? 0),
    timeLockA: Math.max(rowA.timeLockA ?? 0, rowB.timeLockA ?? 0),
    timeLockB: Math.max(rowA.timeLockB ?? 0, rowB.timeLockB ?? 0),
    maxConfidence: Math.min(
      rowA.maxConfidence ?? Infinity,
      rowB.maxConfidence ?? Infinity
    ),
    maxDelay: Math.min(rowA.maxDelay ?? Infinity, rowB.maxDelay ?? Infinity),
    forceCloseType: Math.min(
      rowA.forceCloseType ?? Infinity,
      rowB.forceCloseType ?? Infinity
    ),
    kycType: Math.min(rowA.kycType ?? Infinity, rowB.kycType ?? Infinity),
    cType: Math.min(rowA.cType ?? Infinity, rowB.cType ?? Infinity),
    kycAddress: rowA.kycAddress ?? rowB.kycAddress ?? "",
    type: rowA.type ?? rowB.type ?? "",
    brokerFee: (rowA.brokerFee ?? 0) + (rowB.brokerFee ?? 0),
    funding:
      (rowA.funding ?? 0) +
      (rowB.isAPayingApr ? -(rowB.funding ?? 0) : rowB.funding ?? 0),
    isAPayingApr: rowA.isAPayingApr ?? false,
  };

  return config;
}

interface PrefixData {
  [prefix: string]: {
    [name: string]: {};
  };
}

let prefixData: PrefixData = {};

async function loadPrefixData() {
  if (Object.keys(prefixData).length === 0) {
    const response = await fetch("/getPrefix.json");
    prefixData = await response.json();
  }
}

async function getPrefixedName(name: string): Promise<string | undefined> {
  await loadPrefixData();
  for (const prefix in prefixData) {
    if (prefixData[prefix].hasOwnProperty(name)) {
      return prefix + name;
    }
  }
  return undefined;
}

export {
  getFieldFromAsset,
  getPairConfig,
  getAllProxyTickers,
  adjustQuantities,
  initializeSymbolList,
  loadPrefixData,
  getPrefixedName,
};
