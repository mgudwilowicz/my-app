import { brandColors, brandGradients, brandShadows } from "../../theme/tokens";

export const welcomeColors = {
  backgroundGradient: brandGradients.background,
  headline: brandColors.navy,
  headlineAccent: brandGradients.headline,
  subtitle: brandColors.slate,
  badgeText: brandColors.blueSoft,
  badgeBorder: brandColors.borderBadge,
  badgeBg: brandColors.glassBg,
  statText: brandColors.slateMid,
  statValue: brandColors.navy,
  statBorder: brandColors.borderSubtle,
  statBg: brandColors.glassBgLight,
  hint: brandColors.muted,
  dot: brandColors.teal,
  dotGlow: brandColors.dotGlow,
  primaryGradient: brandGradients.primary,
  primaryShadow: brandShadows.primary,
  primaryShadowHover: brandShadows.primaryHover,
  secondaryText: brandColors.blueDark,
  secondaryBorder: "rgba(43, 111, 150, 0.18)",
  secondaryBg: brandColors.glassBgSecondary,
} as const;

export const welcomePageSx = {
  root: {
    position: "relative",
    width: "100%",
    minHeight: "100vh",
    overflow: "hidden",
    background: welcomeColors.backgroundGradient,
  },
} as const;
