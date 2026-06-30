/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C0152A',
          hover: '#A01022',
          light: '#E8334A',
          blush: '#FDE8EB',
        },
        navy: {
          DEFAULT: '#0F1D2E',
        },
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          400: '#94A3B8',
          500: '#718096',
          600: '#4A5568',
          800: '#1E293B',
          900: '#0F172A',
        },
        status: {
          success: '#16A34A',
          'success-bg': '#DCFCE7',
          warning: '#D97706',
          'warning-bg': '#FEF3C7',
          error: '#DC2626',
          'error-bg': '#FEE2E2',
        },
      },

      fontFamily: {
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },


      borderRadius: {
        sm: '0.375rem',
        md: '0.625rem',
        lg: '0.875rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
      },

      boxShadow: {
        card: '0 1px 3px 0 rgba(15,29,46,.06), 0 4px 16px 0 rgba(15,29,46,.08)',
        'card-hover': '0 4px 6px -1px rgba(15,29,46,.1), 0 8px 32px 0 rgba(15,29,46,.12)',
        button: '0 1px 2px rgba(192,21,42,.25), inset 0 1px 0 rgba(255,255,255,.1)',
        'button-hover': '0 4px 12px rgba(192,21,42,.35)',
      },

      /* ── ANIMATIONS ─────────────────────────────────────── */
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulse_soft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.35s ease-out forwards',
        'pulse-soft': 'pulse_soft 2s ease-in-out infinite',
      },
    },
  },

  plugins: [],
};
