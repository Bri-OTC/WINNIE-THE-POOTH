import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(number: number) {
  // Check if the input is not a number
  if (isNaN(number)) {
    return "Invalid input";
  }

  // Convert the number to a string and split it into integer and decimal parts
  let parts = number.toString().split(".");

  // Add commas for thousands separator to the integer part
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Add trailing zeros to the decimal part if necessary
  if (parts[1] && parts[1].length < 2) {
    parts[1] = parts[1] + "0";
  } else if (!parts[1]) {
    parts[1] = "00";
  }

  // Concatenate the integer and decimal parts with a decimal point
  return parts.join(".");
}

export function addCommas(number: number) {
  // Convert number to string
  let newNumber = number.toString();

  // Split the number into integer and decimal parts
  var parts = newNumber.split(".");
  var integerPart = parts[0];
  var decimalPart = parts.length > 1 ? "." + parts[1] : "";

  // Add commas to the integer part
  var integerWithCommas = "";
  for (var i = integerPart.length - 1, j = 0; i >= 0; i--, j++) {
    if (j > 0 && j % 3 === 0) {
      integerWithCommas = "," + integerWithCommas;
    }
    integerWithCommas = integerPart[i] + integerWithCommas;
  }

  // Return the number with commas
  return integerWithCommas + decimalPart;
}

export const calculateLiquidationPrice = (
  currentPrice: number,
  leverage: number,
  isLong: boolean
) => {
  const liquidationThreshold = 1 / leverage;
  if (isLong) {
    return currentPrice * (1 - liquidationThreshold);
  } else {
    return currentPrice * (1 + liquidationThreshold);
  }
};
