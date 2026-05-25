import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#fffbeb',
          100: '#fef3c7',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          900: '#78350f',
          950: '#451a03',
        },
        surface: {
          base:    '#09090b',
          card:    '#111113',
          raised:  '#1c1c1f',
          overlay: '#27272a',
          input:   '#18181b',
        },
        topic: {
          arrays:       '#3b82f6',
          linkedlists:  '#8b5cf6',
          stacks:       '#ec4899',
          trees:        '#22c55e',
          graphs:       '#f59e0b',
          dp:           '#ef4444',
          binarysearch: '#06b6d4',
          heaps:        '#f97316',
          backtracking: '#a855f7',
          greedy:       '#84cc16',
          tries:        '#14b8a6',
          bitmanip:     '#6366f1',
        },
      },
      boxShadow: {
        'glow-amber-sm': '0 0 8px rgba(245, 158, 11, 0.3)',
        'glow-amber-md': '0 0 16px rgba(245, 158, 11, 0.25), 0 0 32px rgba(245, 158, 11, 0.1)',
        'glow-amber-lg': '0 0 24px rgba(245, 158, 11, 0.4), 0 0 48px rgba(245, 158, 11, 0.15)',
      },
      animation: {
        'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-up':     'fadeUp 0.4s ease-out forwards',
        'shimmer':     'shimmer 1.5s infinite',
        'count-up':    'countUp 0.8s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
export default config
