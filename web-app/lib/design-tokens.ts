export const COLORS = {
  canvas:      "#FBF7F0",
  surface:     "#FFFCF5",
  surfaceSunk: "#F4EFE4",

  sage: {
    50:  "#EEF3EC",
    100: "#DCE8DC",
    200: "#B8D0B9",
    400: "#7A9B7E",
    600: "#4F7A55",
    800: "#2E5D3F",
    900: "#1F3F2C",
  },

  ink: {
    900: "#13312E",
    700: "#2F4944",
    500: "#5E726E",
    300: "#97A6A2",
  },

  amber: {
    50:  "#FBF0DC",
    500: "#E0902C",
    700: "#A86615",
  },

  status: {
    ok:    "#3F8F5B",
    warn:  "#C7872A",
    alert: "#C2453D",
    info:  "#4A7A8F",
  },
} as const;

export const RADIUS = {
  xs: "6px",
  sm: "10px",
  md: "14px",
  lg: "20px",
  xl: "28px",
} as const;

export const SHADOWS = {
  soft: "0 1px 2px rgba(19,49,46,0.04), 0 4px 12px rgba(19,49,46,0.04)",
  lift: "0 4px 8px rgba(19,49,46,0.05), 0 16px 32px rgba(19,49,46,0.06)",
} as const;

export const MOTION = {
  quick: "140ms",
  base:  "220ms",
  deep:  "360ms",
  ease:  "cubic-bezier(0.16, 1, 0.3, 1)",
} as const;
