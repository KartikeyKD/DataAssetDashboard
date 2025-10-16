/**
 * IndiGo Airlines Dashboard - Color Configuration
 * 
 * This file contains all color definitions used throughout the application.
 * Modify colors here to change the entire application's color scheme.
 * 
 * Color Categories:
 * - Primary Colors: IndiGo brand colors
 * - Theme Colors: Aviation-inspired color palette for cards and components
 * - Status Colors: Success, warning, error, and info states
 * - Neutral Colors: Grays and backgrounds
 * - Gradient Definitions: Background gradients for cards and components
 */

// ============================================================================
// PRIMARY COLORS - IndiGo Brand Colors
// ============================================================================

export const PRIMARY_COLORS = {
  // Main IndiGo brand colors
  indigo: {
    primary: '#001B94',      // Main IndiGo blue
    secondary: '#0099FF',    // Sky blue accent
    accent: '#FF6A13',       // Orange accent
    light: '#3b82f6',        // Light blue for connections
  },
  
  // Brand color variations
  brand: {
    navy: '#001475',         // Darker navy for hover states
    skyBlue: '#0080DD',      // Darker sky blue for hover
    darkOrange: '#E55A0F',   // Darker orange for hover
  }
} as const;

// ============================================================================
// AVIATION THEME COLORS - Card and Component Colors
// ============================================================================

export const THEME_COLORS = {
  // Indigo Theme (Primary brand color)
  indigo: {
    50: '#eef2ff',
    100: '#e0e7ff', 
    200: '#c7d2fe',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
  },
  
  // Sky Theme (Aviation sky colors)
  sky: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
  },
  
  // Orange Theme (Aviation warning/alert colors)
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
  },
  
  // Teal Theme (Data/tech colors)
  teal: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
  },
  
  // Purple Theme (Database colors)
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
  },
  
  // Emerald Theme (Success/growth colors)
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
  },
  
  // Amber Theme (Performance/warning colors)
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
  },
  
  // Rose Theme (Attention/critical colors)
  rose: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    400: '#fb7185',
    500: '#f43f5e',
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
  }
} as const;

// ============================================================================
// STATUS COLORS - Success, Warning, Error, Info
// ============================================================================

export const STATUS_COLORS = {
  success: {
    bg: '#ecfdf5',           // Light green background
    text: '#065f46',         // Dark green text
    border: '#a7f3d0',       // Green border
    hover: '#d1fae5',        // Green hover
  },
  
  warning: {
    bg: '#fff7ed',           // Light orange background
    text: '#9a3412',         // Dark orange text
    border: '#fed7aa',       // Orange border
    hover: '#ffedd5',        // Orange hover
  },
  
  error: {
    bg: '#fef2f2',           // Light red background
    text: '#991b1b',         // Dark red text
    border: '#fecaca',       // Red border
    hover: '#fee2e2',        // Red hover
  },
  
  info: {
    bg: '#eff6ff',           // Light blue background
    text: '#1e40af',         // Dark blue text
    border: '#bfdbfe',       // Blue border
    hover: '#dbeafe',        // Blue hover
  }
} as const;

// ============================================================================
// NEUTRAL COLORS - Grays and Backgrounds
// ============================================================================

export const NEUTRAL_COLORS = {
  white: '#ffffff',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Background colors
  background: {
    primary: '#ffffff',      // Main background
    secondary: '#f9fafb',    // Card backgrounds
    muted: '#f3f4f6',        // Muted backgrounds
    accent: 'rgba(0, 27, 148, 0.02)', // Pattern background
  }
} as const;

// ============================================================================
// GRADIENT DEFINITIONS - Card and Background Gradients
// ============================================================================

export const GRADIENTS = {
  // Header gradients
  header: {
    indigo: 'linear-gradient(135deg, #001B94 0%, #0044CC 50%, #0099FF 100%)',
    pattern: 'linear-gradient(135deg, rgba(0, 27, 148, 0.05) 0%, rgba(0, 153, 255, 0.05) 100%)',
  },
  
  // Card background gradients (for MetricCard and CoverageScorecard)
  cards: {
    indigo: {
      base: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2) 0%, rgba(59, 130, 246, 0.15) 50%, rgba(79, 70, 229, 0.05) 100%)',
      hover: 'linear-gradient(135deg, rgba(79, 70, 229, 0.3) 0%, rgba(59, 130, 246, 0.25) 50%, rgba(79, 70, 229, 0.1) 100%)',
    },
    sky: {
      base: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(6, 182, 212, 0.15) 50%, rgba(56, 189, 248, 0.05) 100%)',
      hover: 'linear-gradient(135deg, rgba(14, 165, 233, 0.3) 0%, rgba(6, 182, 212, 0.25) 50%, rgba(56, 189, 248, 0.1) 100%)',
    },
    orange: {
      base: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(245, 158, 11, 0.15) 50%, rgba(251, 146, 60, 0.05) 100%)',
      hover: 'linear-gradient(135deg, rgba(249, 115, 22, 0.3) 0%, rgba(245, 158, 11, 0.25) 50%, rgba(251, 146, 60, 0.1) 100%)',
    },
    teal: {
      base: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(16, 185, 129, 0.15) 50%, rgba(45, 212, 191, 0.05) 100%)',
      hover: 'linear-gradient(135deg, rgba(20, 184, 166, 0.3) 0%, rgba(16, 185, 129, 0.25) 50%, rgba(45, 212, 191, 0.1) 100%)',
    },
    purple: {
      base: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(124, 58, 237, 0.15) 50%, rgba(168, 85, 247, 0.05) 100%)',
      hover: 'linear-gradient(135deg, rgba(147, 51, 234, 0.3) 0%, rgba(124, 58, 237, 0.25) 50%, rgba(168, 85, 247, 0.1) 100%)',
    },
    emerald: {
      base: 'linear-gradient(135deg, rgba(5, 150, 105, 0.2) 0%, rgba(4, 120, 87, 0.15) 50%, rgba(16, 185, 129, 0.05) 100%)',
      hover: 'linear-gradient(135deg, rgba(5, 150, 105, 0.3) 0%, rgba(4, 120, 87, 0.25) 50%, rgba(16, 185, 129, 0.1) 100%)',
    },
    amber: {
      base: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(251, 191, 36, 0.15) 50%, rgba(252, 211, 77, 0.05) 100%)',
      hover: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(251, 191, 36, 0.25) 50%, rgba(252, 211, 77, 0.1) 100%)',
    },
    rose: {
      base: 'linear-gradient(135deg, rgba(244, 63, 94, 0.2) 0%, rgba(225, 29, 72, 0.15) 50%, rgba(251, 113, 133, 0.05) 100%)',
      hover: 'linear-gradient(135deg, rgba(244, 63, 94, 0.3) 0%, rgba(225, 29, 72, 0.25) 50%, rgba(251, 113, 133, 0.1) 100%)',
    },
  },
  
  // Pattern background for main dashboard
  pattern: {
    aviation: `
      radial-gradient(circle at 20% 50%, rgba(0, 27, 148, 0.02) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(0, 153, 255, 0.02) 0%, transparent 50%),
      radial-gradient(circle at 40% 80%, rgba(0, 27, 148, 0.01) 0%, transparent 50%)
    `,
  }
} as const;

// ============================================================================
// UTILITY FUNCTIONS - Helper functions for color manipulation
// ============================================================================

/**
 * Get theme color configuration for cards
 * @param theme - The theme name
 * @returns Color configuration object
 */
export const getCardTheme = (theme: keyof typeof THEME_COLORS) => {
  const colors = THEME_COLORS[theme];
  const gradients = GRADIENTS.cards[theme];
  
  return {
    // Tailwind CSS classes
    gradient: `bg-gradient-to-br from-${theme}-600/20 via-${theme}-600/15 to-${theme}-500/5`,
    hoverGradient: `from-${theme}-600/30 via-${theme}-600/25 to-${theme}-500/10`,
    iconBg: `bg-${theme}-200`,
    iconColor: `text-${theme}-800`,
    cloudColor: `text-${theme}-600`,
    
    // CSS custom properties (for complex gradients)
    cssGradient: gradients?.base,
    cssHoverGradient: gradients?.hover,
    
    // Direct color values
    colors,
  };
};

/**
 * Get status color configuration
 * @param status - The status type
 * @returns Status color configuration
 */
export const getStatusColors = (status: keyof typeof STATUS_COLORS) => {
  return STATUS_COLORS[status];
};

/**
 * Get primary brand colors
 * @returns Primary brand color configuration
 */
export const getPrimaryColors = () => {
  return PRIMARY_COLORS;
};

// ============================================================================
// CSS CUSTOM PROPERTIES - For use in CSS files
// ============================================================================

export const CSS_VARIABLES = `
:root {
  /* Primary Brand Colors */
  --color-primary: ${PRIMARY_COLORS.indigo.primary};
  --color-primary-light: ${PRIMARY_COLORS.indigo.light};
  --color-secondary: ${PRIMARY_COLORS.indigo.secondary};
  --color-accent: ${PRIMARY_COLORS.indigo.accent};
  
  /* Status Colors */
  --color-success: ${STATUS_COLORS.success.text};
  --color-warning: ${STATUS_COLORS.warning.text};
  --color-error: ${STATUS_COLORS.error.text};
  --color-info: ${STATUS_COLORS.info.text};
  
  /* Background Colors */
  --bg-primary: ${NEUTRAL_COLORS.background.primary};
  --bg-secondary: ${NEUTRAL_COLORS.background.secondary};
  --bg-muted: ${NEUTRAL_COLORS.background.muted};
  --bg-pattern: ${NEUTRAL_COLORS.background.accent};
  
  /* Gradients */
  --gradient-header: ${GRADIENTS.header.indigo};
  --gradient-pattern: ${GRADIENTS.pattern.aviation};
}
`;

// ============================================================================
// EXPORT ALL CONFIGURATIONS
// ============================================================================

export default {
  PRIMARY_COLORS,
  THEME_COLORS,
  STATUS_COLORS,
  NEUTRAL_COLORS,
  GRADIENTS,
  getCardTheme,
  getStatusColors,
  getPrimaryColors,
  CSS_VARIABLES,
} as const;
