export const theme = {
  colors: {
    primary: {
      blue: "#2F6FED",
      blueDark: "#1F5BD6",
      blueLight: "#4A82F2",
    },

    background: {
      app: "#F5F7FA",
      card: "#FFFFFF",
      cardBorder: "#E5E7EB",
      tipBackground: "#FEF3C7",
      tipBorder: "#F59E0B",
    },

    text: {
      primary: "#111827",
      secondary: "#6B7280",
      light: "#9CA3AF",
    },

    status: {
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
    },

    kpi: {
      revenue: "#3B82F6",
      profitEbitda: "#10B981",
      cashFlow: "#F97316",
      variableCosts: "#EF4444",
      grossProfit: "#47EF44",
      burnRate: "#E11D48",
      contributionMargin: "#7C3AED",
      monthlyGrowthRate: "#06B6D4",
      bruttofortjeneste: "#0F766E",
    },

    white: "#FFFFFF",
    black: "#000000",
    transparent: "transparent",
  },

  typography: {
    fontFamily: {
      primary: "Inter",
      fallback: "System",
    },

    headline1: {
      fontSize: 48,
      lineHeight: 60,
      fontWeight: "700" as const,
    },

    headline2: {
      fontSize: 34,
      lineHeight: 50,
      fontWeight: "700" as const,
    },

    headline3: {
      fontSize: 28,
      lineHeight: 38,
      fontWeight: "700" as const,
    },

    headline4: {
      fontSize: 18,
      lineHeight: 22,
      fontWeight: "700" as const,
    },

    paragraph: {
      fontSize: 14,
      lineHeight: 24,
      fontWeight: "400" as const,
    },

    button: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "500" as const,
    },

    label: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "500" as const,
    },

    input: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "400" as const,
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 40,
    hero: 64,
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
  },

  borderWidth: {
    thin: 1,
    medium: 1.5,
    thick: 2,
  },

  button: {
    primary: {
      background: "#2F6FED",
      pressed: "#1F5BD6",
      text: "#FFFFFF",
    },
    add: {
      background: "#4A82F2",
      icon: "#FFFFFF",
    },
    favorite: {
      background: "#4A82F2",
      icon: "#FFFFFF",
    },
  },

  input: {
    background: "#FFFFFF",
    border: "#E5E7EB",
    borderError: "#EF4444",
    placeholder: "#9CA3AF",
    text: "#111827",
  },

  card: {
    metric: {
      background: "#FFFFFF",
      border: "#E5E7EB",
    },
    info: {
      background: "#FEF3C7",
      border: "#F59E0B",
    },
    chart: {
      background: "#FFFFFF",
      border: "#E5E7EB",
    },
  },

  navigation: {
    background: "#FFFFFF",
    border: "#E5E7EB",
    active: "#2F6FED",
    inactive: "#9CA3AF",
  },

  modal: {
    background: "#FFFFFF",
    border: "#E5E7EB",
    closeIcon: "#111827",
  },
} as const;

export const colors = theme.colors;
export const typography = theme.typography;
export const spacing = theme.spacing;
export const radius = theme.radius;
export const borderWidth = theme.borderWidth;
export type Theme = typeof theme;
