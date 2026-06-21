/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        // Background shades
        bg: {
          primary: '#07070f',
          secondary: '#0d0d1a',
          tertiary: '#12121f',
          card: '#15152a',
          hover: '#1a1a32',
          border: '#1e1e38',
        },
        // Text
        text: {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
          muted: '#64748b',
          accent: '#a78bfa',
        },
        // Status colors
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand': 'linear-gradient(135deg, #7c3aed, #6d28d9)',
        'gradient-glow': 'linear-gradient(135deg, #7c3aed20, #6d28d900)',
        'mesh-bg': `
          radial-gradient(at 40% 20%, hsla(260, 80%, 20%, 0.4) 0px, transparent 50%),
          radial-gradient(at 80% 0%, hsla(240, 80%, 15%, 0.3) 0px, transparent 50%),
          radial-gradient(at 0% 50%, hsla(280, 70%, 15%, 0.3) 0px, transparent 50%)
        `,
      },
      boxShadow: {
        'glow': '0 0 30px rgba(124, 58, 237, 0.3)',
        'glow-sm': '0 0 15px rgba(124, 58, 237, 0.2)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(124, 58, 237, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(124, 58, 237, 0.5)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
