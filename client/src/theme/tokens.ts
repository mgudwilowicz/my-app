/** Shared brand colors — source of truth for welcome page and app theme. */
export const brandColors = {
  blue: "#2f9bd6",
  blueMid: "#2b8fd0",
  blueSoft: "#2b7fb8",
  blueDark: "#2b6f96",
  teal: "#4cc3a1",
  tealDark: "#3fbf94",
  navy: "#1b3a52",
  slate: "#547189",
  slateMid: "#3c6483",
  muted: "#87a3b8",
  bgStart: "#f0f7ff",
  bgMid: "#e8f4fd",
  bgEnd: "#eef9fb",
  borderSubtle: "rgba(91, 156, 214, 0.18)",
  borderBadge: "rgba(91, 156, 214, 0.25)",
  glassBg: "rgba(255, 255, 255, 0.7)",
  glassBgLight: "rgba(255, 255, 255, 0.65)",
  glassBgSecondary: "rgba(255, 255, 255, 0.75)",
  dotGlow: "rgba(76, 195, 161, 0.2)",
  takenBorder: "#8dd8bb",
  white: "#ffffff",
} as const;

export const brandGradients = {
  background:
    "linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 50%, #eef9fb 100%)",
  headline: "linear-gradient(90deg, #2b8fd0, #4cc3a1)",
  primary: "linear-gradient(135deg, #2f9bd6, #4cc3a1)",
} as const;

export const brandShadows = {
  primary: "0 10px 24px rgba(47, 155, 214, 0.32)",
  primaryHover: "0 14px 30px rgba(47, 155, 214, 0.4)",
  badge: "0 4px 14px rgba(91,156,214,0.08)",
} as const;
