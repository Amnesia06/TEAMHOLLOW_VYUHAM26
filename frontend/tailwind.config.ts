import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAFAFC",
        surface: "#FFFFFF",
        primary: {
          DEFAULT: "#7468F5",
          hover: "#6154E8",
          subtle: "#F0EEFE",
        },
        secondary: {
          DEFAULT: "#A5A0FF",
          subtle: "#F5F4FF",
        },
        text: {
          DEFAULT: "#171923",
          muted: "#85889A",
          subtle: "#A0A3BD",
        },
        border: {
          DEFAULT: "#E9E9F0",
          light: "#F2F2F7",
        },
        accent: {
          green: "#10B981",
          greenSubtle: "#ECFDF5",
          amber: "#F59E0B",
          amberSubtle: "#FFFBEB",
          rose: "#EF4444",
          roseSubtle: "#FEF2F2",
          blue: "#3B82F6",
          blueSubtle: "#EFF6FF",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.02)",
        float: "0 10px 30px -5px rgba(116, 104, 245, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.02)",
        subtle: "0 4px 20px -2px rgba(23, 25, 35, 0.04)",
      }
    },
  },
  plugins: [],
};
export default config;
