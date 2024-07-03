import { parseUnits } from "viem";
import { toast } from "react-toastify";
import {
  sendSignedCloseQuote,
  SignedCloseQuoteRequest,
} from "@pionerfriends/api-client";
import { networks, NetworkKey } from "@pionerfriends/blockchain-client";

export interface CloseQuoteParams {
  price: string;
  isTP: boolean;
  wallet: any;
  token: string;
  walletClient: any;
  activeChainId: number;
  bContractId: number;
  amountContract: string;
  pA: string;
  pB: string;
  isLong: boolean;
}

export const handleCloseQuote = async ({
  price,
  isTP,
  wallet,
  token,
  walletClient,
  activeChainId,
  bContractId,
  amountContract,
  pA,
  pB,
  isLong,
}: CloseQuoteParams): Promise<boolean> => {
  console.log("handleCloseQuote", {
    price,
    isTP,
    wallet,
    token,
    walletClient,
    activeChainId,
    bContractId,
    amountContract,
    pA,
    pB,
    isLong,
  });

  if (!wallet || !wallet.address || !token || !walletClient) {
    console.error("Wallet, wallet address, token, or walletClient is missing");
    return false;
  }

  try {
    const ethersProvider = await wallet.getEthersProvider();
    const ethersSigner = await ethersProvider.getSigner();

    const domainClose = {
      name: "PionerV1Close",
      version: "1.0",
      chainId: activeChainId,
      verifyingContract:
        networks[activeChainId as unknown as NetworkKey].contracts
          .PionerV1Close,
    };

    const OpenCloseQuoteType = {
      OpenCloseQuote: [
        { name: "bContractId", type: "uint256" },
        { name: "price", type: "uint256" },
        { name: "amount", type: "uint256" },
        { name: "limitOrStop", type: "uint256" },
        { name: "expiry", type: "uint256" },
        { name: "authorized", type: "address" },
        { name: "nonce", type: "uint256" },
      ],
    };

    const nonce = Date.now().toString();
    const limitOrStop = isTP ? 0 : parseUnits(price, 18).toString();
    const expiry = 315350000000;

    const counterpartyAddress =
      wallet.address.toLowerCase() === pA.toLowerCase() ? pB : pA;

    if (amountContract === "0" || price === "0") {
      toast.error(`Failed to send close quote ${amountContract}, ${price}`);
      return false;
    }

    const openCloseQuoteValue = {
      bContractId: bContractId,
      price: parseUnits(price, 18).toString(),
      amount: amountContract,
      limitOrStop: limitOrStop.toString(),
      expiry: expiry.toString(),
      authorized: counterpartyAddress,
      nonce: nonce,
    };

    const signatureClose = await ethersSigner._signTypedData(
      domainClose,
      OpenCloseQuoteType,
      openCloseQuoteValue
    );

    const closeQuote: SignedCloseQuoteRequest = {
      issuerAddress: wallet.address,
      counterpartyAddress: counterpartyAddress,
      version: "1.0",
      chainId: Number(activeChainId),
      verifyingContract:
        networks[activeChainId as unknown as NetworkKey].contracts
          .PionerV1Close,
      bcontractId: openCloseQuoteValue.bContractId,
      isLong: isLong,
      price: openCloseQuoteValue.price,
      amount: openCloseQuoteValue.amount,
      limitOrStop: openCloseQuoteValue.limitOrStop,
      expiry: openCloseQuoteValue.expiry,
      authorized: openCloseQuoteValue.authorized,
      nonce: openCloseQuoteValue.nonce,
      signatureClose: signatureClose,
      emitTime: Date.now().toString(),
      messageState: 0,
    };
    console.log("closeQuote", closeQuote);

    await sendSignedCloseQuote(closeQuote, token);
    toast.success(
      `Close quote sent successfully for ${isTP ? "Take Profit" : "Stop Loss"}`,
      {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
    return true;
  } catch (error) {
    console.error("Error in handleCloseQuote:", error);
    toast.error(
      `Failed to send close quote for ${isTP ? "Take Profit" : "Stop Loss"}`,
      {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
    return false;
  }
};
