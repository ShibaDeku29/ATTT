export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6",
        'primary-dark': "#1e40af",
        secondary: "#8b5cf6",
        success: "#10b981",
        'success-dark': "#059669",
        danger: "#ef4444",
        'dark-bg': 'var(--bg-primary)',
        'dark-bg-darker': 'var(--bg-secondary)',
        'dark-card': 'var(--bg-card)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        border: 'var(--border-color)',
      },
    },
  },
  plugins: [],
}
