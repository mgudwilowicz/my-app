export const welcomeColors = {
  backgroundGradient:
    "linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 50%, #eef9fb 100%)",
  headline: "#1b3a52",
  headlineAccent: "linear-gradient(90deg, #2b8fd0, #4cc3a1)",
  subtitle: "#547189",
  badgeText: "#2b7fb8",
  badgeBorder: "rgba(91, 156, 214, 0.25)",
  badgeBg: "rgba(255, 255, 255, 0.7)",
  statText: "#3c6483",
  statValue: "#1b3a52",
  statBorder: "rgba(91, 156, 214, 0.18)",
  statBg: "rgba(255, 255, 255, 0.65)",
  hint: "#87a3b8",
  dot: "#4cc3a1",
  dotGlow: "rgba(76, 195, 161, 0.2)",
  primaryGradient: "linear-gradient(135deg, #2f9bd6, #4cc3a1)",
  primaryShadow: "0 10px 24px rgba(47, 155, 214, 0.32)",
  primaryShadowHover: "0 14px 30px rgba(47, 155, 214, 0.4)",
  secondaryText: "#2b6f96",
  secondaryBorder: "rgba(43, 111, 150, 0.18)",
  secondaryBg: "rgba(255, 255, 255, 0.75)",
} as const;

export const welcomePageSx = {
  root: {
    position: "relative",
    width: "100%",
    minHeight: "100vh",
    overflow: "hidden",
    background: welcomeColors.backgroundGradient,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
} as const;
