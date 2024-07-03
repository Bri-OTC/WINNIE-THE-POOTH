import { ethers } from "ethers";

/// @dev to set in the sdk
export const convertToBytes32 = (str: string): string => {
  const maxLength = 31;
  const truncatedStr = str.slice(0, maxLength);
  const bytes32 = ethers.utils.formatBytes32String(truncatedStr);
  return bytes32;
};

/// @dev to set in the sdk
export const convertFromBytes32 = (input: string): string => {
  if (!input || input === "") {
    return "";
  }

  try {
    // Check if the input is a valid bytes32 string
    if (input.startsWith("0x") && input.length === 66) {
      return ethers.utils.parseBytes32String(input).replace(/\0/g, "");
    } else {
      return input;
    }
  } catch (error) {
    return input; // Return the original input if conversion fails
  }
};

/// @dev to set in the sdk
export const parseDecimalValue = (value: string): string => {
  try {
    const [integerPart, decimalPart = ""] = value.replace("n", "").split(".");
    const paddedDecimalPart = decimalPart.padEnd(18, "0").slice(0, 18);
    const wei = ethers.utils.parseUnits(
      integerPart + "." + paddedDecimalPart,
      18
    );
    return String(wei.toString());
  } catch (error) {
    console.error("Error parsing decimal value:", error);
    return "0";
  }
};

const prefixList = ["forex", "crypto", "nasdaq"];

export function removePrefix(market: string): string {
  if (!market || typeof market !== "string") {
    return "";
  }

  const parts = market.split("/");
  if (parts.length !== 2) {
    return market; // Return original if it doesn't contain exactly one '/'
  }

  const [base, quote] = parts;

  const removePrefixtFromPart = (part: string) => {
    if (!part) return "";
    return prefixList.reduce(
      (acc, prefix) => acc.replace(new RegExp(`^${prefix}\\.`, "i"), ""),
      part
    );
  };

  const baseWithoutPrefix = removePrefixtFromPart(base);
  const quoteWithoutPrefix = removePrefixtFromPart(quote);

  return `${baseWithoutPrefix}/${quoteWithoutPrefix}`;
}
