/**
 * Corpus AI Design Tokens
 * Centralized design system configuration
 */

export const colors = {
  primary: '#BF56FF',
  primaryLight: '#F1E7FF',
  primaryDark: '#AC5DE6',
  gradient: {
    from: '#FC5990',
    to: '#AC5DE6',
  },
  purple: {
    50: '#FAF6FF',
    100: '#F1E7FF',
    200: '#E4CFFF',
    300: '#D0A8E9',
    400: '#CD7BFF',
    500: '#BF56FF',
    600: '#AC5DE6',
  },
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
};

export const borderRadius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  full: '9999px',
};

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
};

export const typography = {
  fontFamily: {
    sans: 'var(--font-geist-sans), "Helvetica Neue", Helvetica, Arial, sans-serif',
    mono: 'var(--font-geist-mono), Menlo, Monaco, "Courier New", monospace',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

export const transitions = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
};

/**
 * Status badge color mappings
 */
export const statusColors = {
  ACTIVE: {
    bg: colors.status.success,
    text: 'white',
  },
  BUILDING: {
    bg: colors.status.warning,
    text: 'gray-900',
  },
  ERROR: {
    bg: colors.status.error,
    text: 'white',
  },
  INACTIVE: {
    bg: colors.gray[400],
    text: 'white',
  },
};

/**
 * Gradient utility classes
 */
export const gradients = {
  purple: 'bg-gradient-to-r from-[#FC5990] to-[#AC5DE6]',
  purpleLight: 'bg-gradient-to-r from-[#F1E7FF] to-[#E4CFFF]',
};
