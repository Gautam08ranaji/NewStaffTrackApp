// typography.ts
export const typography = {
  // Sahara Typography System
  fontH1: { fontSize: 28, fontWeight: "700", lineHeight: 36 },
  fontH2: { fontSize: 24, fontWeight: "700", lineHeight: 32 },
  fontH3: { fontSize: 22, fontWeight: "600", lineHeight: 30 },
  fontH4: { fontSize: 20, fontWeight: "600", lineHeight: 28 },
  fontH5: { fontSize: 18, fontWeight: "500", lineHeight: 26 },
  fontH6: { fontSize: 16, fontWeight: "500", lineHeight: 24 },

  fontBodyLarge: { fontSize: 18, fontWeight: "400", lineHeight: 28 },
  fontBody: { fontSize: 16, fontWeight: "400", lineHeight: 24 },
  fontBodySmall: { fontSize: 14, fontWeight: "400", lineHeight: 24 },
  fontCaption: { fontSize: 13, fontWeight: "400", lineHeight: 18 },

  fontButtonLarge: { fontSize: 18, fontWeight: "600", lineHeight: 24 },
  fontButton: { fontSize: 16, fontWeight: "600", lineHeight: 22 },

  fontLabel: { fontSize: 15, fontWeight: "500", lineHeight: 20 },
  fontTag: { fontSize: 13, fontWeight: "500", lineHeight: 18 },
  fontToast: { fontSize: 16, fontWeight: "500", lineHeight: 22 },
  fontBadge: { fontSize: 12, fontWeight: "600", lineHeight: 16 },
  fontInput: { fontSize: 16, fontWeight: "400", lineHeight: 22 },
  fontLink: { fontSize: 17, fontWeight: "500", lineHeight: 22 },
  fontNav: { fontSize: 15, fontWeight: "500", lineHeight: 20 },
  fontTooltip: { fontSize: 13, fontWeight: "400", lineHeight: 18 },
} as const;

export type Typography = typeof typography;
