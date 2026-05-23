import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import animationData from "../utils/db/lottie-json"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const ainmationDefaultOptions = {
  loop: true,
  autoplay: true,
  animationData
}