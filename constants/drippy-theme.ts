import { DrippyColor } from "@/context/ProfileContext";

type ColorOption = {
  key: DrippyColor;
  label: string;
  hex: string;
};

export const DRIPPY_COLOR_OPTIONS: ColorOption[] = [
  { key: "oceanBlue", label: "Ocean Blue", hex: "#4FC3F7" },
  { key: "softPurple", label: "Soft Purple", hex: "#A78BFA" },
  { key: "mintGreen", label: "Mint Green", hex: "#6EE7B7" },
  { key: "blushPink", label: "Blush Pink", hex: "#F9A8D4" },
];

export const DRIPPY_COLOR_MAP: Record<DrippyColor, string> = {
  oceanBlue: "#4FC3F7",
  softPurple: "#A78BFA",
  mintGreen: "#6EE7B7",
  blushPink: "#F9A8D4",
};

export const APP_GRADIENT = ["#F3FAFF", "#E8F3FF", "#EDEBFF"] as const;
export const CARD_GRADIENT = ["#FFFFFF", "#F4F9FF"] as const;
export const BUTTON_GRADIENT = ["#3F8DFF", "#6F9CFF"] as const;

