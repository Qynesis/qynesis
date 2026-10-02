import { SERVICES } from "./services";

export const OTHER_SERVICE = "Other";

/** Every service from the Services section, then "Other" (plain text: no hard spaces) */
export const SERVICE_OPTIONS: string[] = [
  ...SERVICES.map((service) => service.title.replace(/ /g, " ")),
  OTHER_SERVICE,
];

export const BUDGET_OPTIONS: string[] = [
  "Under $5k",
  "$5k - $10k",
  "$10k - $25k",
  "$25k - $50k",
  "$50k+",
];
