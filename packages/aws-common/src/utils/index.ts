import { nanoid } from "nanoid";

export * from "./env";

export const uniqueTimestamp = () => {
  return new Date().toISOString().slice(0, -5) + "#" + nanoid(8);
};

export function getTitleFromOriginUrl(origin: string) {
  if (!origin || origin === "files") {
    return "files";
  }
  const url = new URL(origin);
  const host = url.host;
  const tokens = host.split(".");
  const lv1Domain = tokens.pop();
  const lv2Domain = tokens.pop();
  return `${lv2Domain}.${lv1Domain}`;
}

export function getPlanNameFromUserTier(tier: number | undefined) {
  switch (tier) {
    case 0:
    default:
      return "Free";
    case 1:
      return "Starter";
    case 2:
      return "Standard";
    case 3:
      return "Business";
  }
}
