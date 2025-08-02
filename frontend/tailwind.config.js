/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Award-winning AI-first color palette
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // Deep Purple - AI intelligence
          600: '#5a67d8',
          700: '#4c51bf',
          800: '#434190',
          900: '#3c366b',
        },
        electric: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Electric Blue - Technology
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // Emerald Green - Success/Growth
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // Warm Orange - Energy/Innovation
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        dark: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#0f172a', // Rich Black
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.2)',
          dark: 'rgba(0, 0, 0, 0.1)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Orbitron', 'monospace'], // Futuristic display font
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        'hero': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display': ['3.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      backdropBlur: {
        xs: '2px',
        '4xl': '72px',
      },
      animation: {
        // Award-winning animations
        'gradient': 'gradient 15s ease infinite',
        'gradient-slow': 'gradient 20s ease infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'scan': 'scan 2s linear infinite',
        'hologram': 'hologram 3s ease-in-out infinite',
        'particle-float': 'particleFloat 20s ease-in-out infinite',
        'typing': 'typing 3.5s steps(40, end)',
        'blink': 'blink 1s infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { 
            backgroundPosition: '0% 50%',
            transform: 'rotate(0deg)'
          },
          '50%': { 
            backgroundPosition: '100% 50%',
            transform: 'rotate(180deg)'
          },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(30px) scale(0.9)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0) scale(1)' 
          },
        },
        slideUp: {
          '0%': { 
            transform: 'translateY(20px)', 
            opacity: '0' 
          },
          '100%': { 
            transform: 'translateY(0)', 
            opacity: '1' 
          },
        },
        slideInRight: {
          '0%': { 
            transform: 'translateX(100px)', 
            opacity: '0' 
          },
          '100%': { 
            transform: 'translateX(0)', 
            opacity: '1' 
          },
        },
        scaleIn: {
          '0%': { 
            transform: 'scale(0.8)', 
            opacity: '0' 
          },
          '100%': { 
            transform: 'scale(1)', 
            opacity: '1' 
          },
        },
        glow: {
          '0%': { 
            boxShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor' 
          },
          '100%': { 
            boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor' 
          },
        },
        pulseGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 5px currentColor',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 20px currentColor, 0 0 30px currentColor',
            transform: 'scale(1.05)'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-10px) rotate(1deg)' },
          '66%': { transform: 'translateY(5px) rotate(-1deg)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        hologram: {
          '0%, 100%': { 
            opacity: '1',
            filter: 'hue-rotate(0deg)'
          },
          '50%': { 
            opacity: '0.8',
            filter: 'hue-rotate(90deg)'
          },
        },
        particleFloat: {
          '0%, 100%': { 
            transform: 'translate3d(0, 0, 0) rotate(0deg)' 
          },
          '33%': { 
            transform: 'translate3d(30px, -30px, 0) rotate(120deg)' 
          },
          '66%': { 
            transform: 'translate3d(-20px, 20px, 0) rotate(240deg)' 
          },
        },
        typing: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        blink: {
          '0%, 50%': { borderColor: 'transparent' },
          '51%, 100%': { borderColor: 'currentColor' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-ai': 'linear-gradient(135deg, #6366f1 0%, #3b82f6 50%, #10b981 100%)',
        'gradient-glow': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
        'gradient-success': 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
        'gradient-warning': 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'mesh-gradient': 'radial-gradient(at 40% 20%, #6366f1 0px, transparent 50%), radial-gradient(at 80% 0%, #3b82f6 0px, transparent 50%), radial-gradient(at 0% 50%, #10b981 0px, transparent 50%), radial-gradient(at 80% 50%, #8b5cf6 0px, transparent 50%), radial-gradient(at 0% 100%, #ec4899 0px, transparent 50%), radial-gradient(at 80% 100%, #f59e0b 0px, transparent 50%), radial-gradient(at 0% 0%, #6366f1 0px, transparent 50%)',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(99, 102, 241, 0.5)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.5)',
        'glow-lg': '0 0 30px rgba(99, 102, 241, 0.5)',
        'glow-electric': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.5)',
        'glow-warning': '0 0 20px rgba(245, 158, 11, 0.5)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-lg': '0 16px 64px 0 rgba(31, 38, 135, 0.37)',
        'inner-glow': 'inset 0 0 20px rgba(99, 102, 241, 0.3)',
        'neural': '0 0 0 1px rgba(99, 102, 241, 0.3), 0 4px 16px rgba(99, 102, 241, 0.2), 0 8px 32px rgba(99, 102, 241, 0.1)',
      },
      backdropFilter: {
        'glass': 'blur(16px) saturate(180%)',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        // Glassmorphism utilities
        '.glass': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          background: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-strong': {
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(20px) saturate(200%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        },
        // Neural network patterns
        '.neural-grid': {
          backgroundImage: `
            radial-gradient(circle at 25% 25%, #6366f1 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, #3b82f6 2px, transparent 2px)
          `,
          backgroundSize: '50px 50px',
        },
        // Holographic effects
        '.holographic': {
          background: 'linear-gradient(135deg, transparent 0%, rgba(99, 102, 241, 0.1) 25%, transparent 50%, rgba(59, 130, 246, 0.1) 75%, transparent 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradient 15s ease infinite',
        },
        // Text effects
        '.text-glow': {
          textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
        },
        '.text-hologram': {
          background: 'linear-gradient(135deg, #6366f1, #3b82f6, #10b981, #f59e0b)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundSize: '400% 400%',
          animation: 'gradient 8s ease infinite',
        },
        // Animation states
        '.animate-on-scroll': {
          opacity: '0',
          transform: 'translateY(30px)',
          transition: 'all 0.6s ease-out',
        },
        '.animate-on-scroll.visible': {
          opacity: '1',
          transform: 'translateY(0)',
        },
        // Performance optimizations
        '.gpu-accelerated': {
          transform: 'translateZ(0)',
          willChange: 'transform',
        },
        '.hardware-accelerated': {
          transform: 'translate3d(0, 0, 0)',
          willChange: 'transform, opacity',
        },
      }
      addUtilities(newUtilities)
    }
  ],
} 