export type Stage =
  | "CONCEPTION"
  | "DEVELOPMENT"
  | "PROTOTYPING"
  | "MERCHANDISING"
  | "PRODUCTION"
  | "DELIVERY"
  | "SALES"
  | "ARCHIVED";

export const STAGE_ORDER: Stage[] = [
  "CONCEPTION",
  "DEVELOPMENT",
  "PROTOTYPING",
  "MERCHANDISING",
  "PRODUCTION",
  "DELIVERY",
  "SALES",
  "ARCHIVED",
];

export const STAGE_LABELS: Record<Stage, string> = {
  CONCEPTION: "Conception",
  DEVELOPMENT: "Development",
  PROTOTYPING: "Prototyping",
  MERCHANDISING: "Merchandising",
  PRODUCTION: "Production",
  DELIVERY: "Delivery",
  SALES: "Sales",
  ARCHIVED: "Archived",
};

export const STAGE_COLORS: Record<Stage, string> = {
  CONCEPTION: "bg-purple-100 text-purple-800",
  DEVELOPMENT: "bg-blue-100 text-blue-800",
  PROTOTYPING: "bg-cyan-100 text-cyan-800",
  MERCHANDISING: "bg-amber-100 text-amber-800",
  PRODUCTION: "bg-orange-100 text-orange-800",
  DELIVERY: "bg-emerald-100 text-emerald-800",
  SALES: "bg-green-100 text-green-800",
  ARCHIVED: "bg-gray-100 text-gray-800",
};
