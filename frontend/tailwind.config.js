/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hospital: {
          darkest: '#070D18',
          card: '#0F172A',
          cardBorder: '#1E293B',
          panel: '#131D31',
          accent: '#06B6D4', // Cyan
        },
        triage: {
          critical: '#EF4444',
          urgent: '#F59E0B',
          semiurgent: '#3B82F6',
          stable: '#10B981',
        },
        telemetry: {
          green: '#10B981',
          amber: '#F59E0B',
          red: '#EF4444',
          blue: '#38BDF8',
          cyan: '#06B6D4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
