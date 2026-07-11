// Pure constants only — no "server-only" import here, so client components can safely
// import from this module directly (see components/payment/CreateOrderButton.tsx).

export const TOTAL_DAYS = 28;
export const FREE_TRIAL_DAY = 1;
export const PROGRAM_PRICE = 299000;
export const PROGRAM_PRICE_LABEL = "299.000đ";

export const SURVEY_ROLES = [
  { value: "nha-thuoc", label: "Nhà thuốc" },
  { value: "quay-thuoc", label: "Quầy thuốc" },
  { value: "sinh-vien", label: "Sinh viên Dược" },
  { value: "khac", label: "Khác" },
] as const;
