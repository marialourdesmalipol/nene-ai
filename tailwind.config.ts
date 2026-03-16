import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
  	extend: {
      fontFamily: {
        display: ['"Palatino Linotype"', '"Book Antiqua"', 'Palatino', 'Georgia', 'serif'],
        ui: ['"Trebuchet MS"', '"Segoe UI"', 'Tahoma', 'Geneva', 'sans-serif'],
      },
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
        rose: {
          DEFAULT: 'hsl(var(--rose))',
          dark: 'hsl(var(--rose-dark))',
          mid: 'hsl(var(--rose-mid))',
          pale: 'hsl(var(--rose-pale))',
          faint: 'hsl(var(--rose-faint))',
        },
        lilac: {
          DEFAULT: 'hsl(var(--lilac))',
          pale: 'hsl(var(--lilac-pale))',
        },
        cream: 'hsl(var(--cream))',
        sand: 'hsl(var(--sand))',
        text: {
          DEFAULT: 'hsl(var(--text))',
          mid: 'hsl(var(--text-mid))',
          light: 'hsl(var(--text-light))',
        },
        green: {
          DEFAULT: 'hsl(var(--green))',
          pale: 'hsl(var(--green-pale))',
        },
        amber: {
          DEFAULT: 'hsl(var(--amber))',
          pale: 'hsl(var(--amber-pale))',
        },
        red: {
          DEFAULT: 'hsl(var(--red))',
          pale: 'hsl(var(--red-pale))',
        },
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
