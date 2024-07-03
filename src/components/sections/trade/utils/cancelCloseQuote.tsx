//cancelCloseQuote
import {
  sendSignedCancelCloseQuote,
  SignedCancelCloseQuoteRequest,
} from "@pionerfriends/api-client";
import { useAuthStore } from "@/store/authStore";
import { useWalletAndProvider } from "@/components/layout/menu";
import {
  networks,
  contracts,
  NetworkKey,
} from "@pionerfriends/blockchain-client";
import { Order } from "@/components/sections/trade/SectionOrders";
import { toast } from "react-toastify";
import { config } from "@/config";
import { ethers } from "ethers";

export async function cancelCloseQuote(
  order: Order,
  wallet: any,
  token: string,
  provider: any
) {
  if (!wallet || !token || !wallet.address) {
    console.error("Missing wallet, token, walletClient or wallet.address");
    toast.error("Failed to cancel close quote: Invalid wallet or token");
    return false;
  }
  console.log("cancelCloseQuote", order);

  try {
    const ethersProvider = await wallet.getEthersProvider();
    const ethersSigner = await ethersProvider.getSigner();
    const nonce = Date.now().toString();

    console.log("ethersSigner", ethersSigner);

    const domainClose = {
      name: "PionerV1Close",
      version: "1.0",
      chainId: Number(config.activeChainId),
      verifyingContract:
        networks[config.activeChainId as unknown as NetworkKey].contracts
          .PionerV1Close,
    };

    const cancelSignType = {
      CancelRequestSign: [
        { name: "orderHash", type: "bytes" },
        { name: "nonce", type: "uint256" },
      ],
    };

    const cancelSignValue = {
      orderHash: order.targetHash,
      nonce: nonce,
    };

    console.log("cancelSignValue", cancelSignValue);

    const signatureCancel = await ethersSigner._signTypedData(
      domainClose,
      cancelSignType,
      cancelSignValue
    );

    const cancel: SignedCancelCloseQuoteRequest = {
      issuerAddress: wallet.address,
      counterpartyAddress: order.counterpartyAddress,
      version: "1.0",
      chainId: Number(config.activeChainId),
      verifyingContract:
        networks[config.activeChainId as unknown as NetworkKey].contracts
          .PionerV1Close,
      targetHash: cancelSignValue.orderHash,
      nonceCancel: nonce,
      signature: signatureCancel,
      emitTime: nonce,
      messageState: 0,
    };

    const success = await sendSignedCancelCloseQuote(cancel, token);

    if (!success) {
      toast.error("Failed to cancel close quote");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error canceling close quote:", error);
    toast.error("An error occurred while canceling the close quote");
    return false;
  }
}
