import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateText(text: string, length: number = 20) {
  if (text.length <= length) return text;
  return `${text.slice(0, length)}...`;
}

export function logger(message: string, data?: object) {
  if (process.env.BUN_PUBLIC_LOGGER === 'true') {
    console.log(message, data ? data : '');
  }
}