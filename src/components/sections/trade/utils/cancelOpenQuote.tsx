//cancelO
import {
  sendSignedCancelOpenQuote,
  SignedCancelOpenQuoteRequest,
  sendSignedCancelCloseQuote,
  signedCancelCloseQuoteResponse,
} from "@pionerfriends/api-client";
import { useAuthStore } from "@/store/authStore";
import { useWalletAndProvider } from "@/components/layout/menu";
import { parseUnits } from "viem";
import {
  networks,
  contracts,
  NetworkKey,
} from "@pionerfriends/blockchain-client";
import { Order } from "@/components/sections/trade/SectionOrders";
import { toast } from "react-toastify";
import { config } from "@/config";
import { ethers } from "ethers";

export async function cancelOrder(
  order: Order,
  wallet: any,
  token: string,
  provider: any
) {
  console.log("Attempting to cancel order:", order);

  if (!wallet || !token || !wallet.address) {
    console.error("Missing wallet, token, walletClient or wallet.address");
    toast.error("Failed to cancel order: Invalid wallet or token");
    return false;
  }

  if (!order.targetHash) {
    console.warn(
      "Order targetHash is empty. Attempting to proceed with available data."
    );
    // You might want to consider returning false here if targetHash is absolutely required
  }

  try {
    const ethersProvider = await wallet.getEthersProvider();
    const ethersSigner = await ethersProvider.getSigner();
    const nonce = Date.now();

    console.log("ethersSigner:", ethersSigner);

    const domainOpen = {
      name: "PionerV1Open",
      version: "1.0",
      chainId: Number(config.activeChainId),
      verifyingContract:
        networks[config.activeChainId as unknown as NetworkKey].contracts
          .PionerV1Open,
    };

    const cancelSignType = {
      CancelRequestSign: [
        { name: "orderHash", type: "bytes32" },
        { name: "nonce", type: "uint256" },
      ],
    };

    const cancelSignValue = {
      orderHash:
        ethers.utils.keccak256(order.targetHash) || ethers.constants.HashZero, // Use a zero hash if targetHash is empty
      nonce: nonce,
    };

    console.log("cancelSignValue:", cancelSignValue);

    const signatureCancel = await ethersSigner._signTypedData(
      domainOpen,
      cancelSignType,
      cancelSignValue
    );

    const cancel: SignedCancelOpenQuoteRequest = {
      issuerAddress: wallet.address,
      counterpartyAddress:
        order.counterpartyAddress || ethers.constants.AddressZero,
      version: "1.0",
      chainId: Number(config.activeChainId),
      verifyingContract:
        networks[config.activeChainId as unknown as NetworkKey].contracts
          .PionerV1Open,
      targetHash: order.targetHash,
      nonceCancel: cancelSignValue.nonce.toString(),
      signatureCancel: signatureCancel,
      emitTime: Date.now().toString(),
      messageState: 0,
    };

    console.log("Sending cancel request:", cancel);

    const success = await sendSignedCancelOpenQuote(cancel, token);

    if (!success) {
      console.error("Failed to cancel order");
      toast.error("Failed to cancel order");
      return false;
    }

    console.log("Order cancelled successfully");
    return true;
  } catch (error) {
    console.error("Error canceling order:", error);
    toast.error("An error occurred while canceling the order");
    return false;
  }
}
