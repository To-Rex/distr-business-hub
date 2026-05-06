import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatWithSpaces(value: number, maximumFractionDigits = 2): string {
  return new Intl.NumberFormat("uz-UZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
    useGrouping: true,
  })
    .format(value)
    .replaceAll("\u00A0", " ")
    .replaceAll(",", " ");
}
