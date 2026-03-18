/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode (originally from dashboard)
  theme: {
    extend: {
      colors: {
        // --- Website Colors ---
        background: {
          DEFAULT: '#ffffff',
          card: 'var(--color-background-card)',
          'card-alt': 'var(--color-background-card-alt)',
          elevated: 'var(--color-background-elevated)',
          glass: 'var(--color-background-glass)',
        },
        surface: {
          DEFAULT: '#f8fafc',
          hover: 'var(--color-surface-hover)',
          active: 'var(--color-surface-active)',
        },
        primary: '#6366f1',
        secondary: '#0ea5e9',
        accent: '#f43f5e',
        'glass-border': 'rgba(0, 0, 0, 0.08)',
        'glass-bg': 'rgba(255, 255, 255, 0.8)',
        'glass-highlight': 'rgba(0, 0, 0, 0.05)',
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        // --- Dashboard Colors ---
        brand: {
          primary: 'var(--color-brand-primary)',
          'primary-hover': 'var(--color-brand-primary-hover)',
          'primary-light': 'var(--color-brand-primary-light)',
          secondary: 'var(--color-brand-secondary)',
          'secondary-hover': 'var(--color-brand-secondary-hover)',
          accent: 'var(--color-brand-accent)',
        },
        foreground: {
          DEFAULT: "hsl(var(--foreground))",
          secondary: 'var(--color-foreground-secondary)',
          muted: 'var(--color-foreground-muted)',
          inverse: 'var(--color-foreground-inverse)',
        },
        border: {
          DEFAULT: "hsl(var(--border))",
          light: 'var(--color-border-light)',
          strong: 'var(--color-border-strong)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          light: 'var(--color-success-light)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          light: 'var(--color-warning-light)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          light: 'var(--color-error-light)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          light: 'var(--color-info-light)',
        },

        // Dashboard glass object
        glass: {
          border: 'var(--color-glass-border)',
          bg: 'var(--color-glass-bg)',
          highlight: 'var(--color-glass-highlight)',
        },
      },

      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        casual: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },

      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        'card': 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        'primary': 'var(--shadow-primary)',
        'primary-strong': 'var(--shadow-primary-strong)',
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #2a2a2a 0deg, #1a1a1a 50%, #2a2a2a 100%)',
        'gradient-primary': 'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary))',
      },

      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          'from': { boxShadow: '0 0 10px -10px rgba(99, 102, 241, 0)' },
          'to': { boxShadow: '0 0 20px 5px rgba(99, 102, 241, 0.3)' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          'from': { opacity: '0', transform: 'translateY(-10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}
