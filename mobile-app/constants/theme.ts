import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1B3A2B',               // Deep forest text
    textSecondary: '#4A6B54',      // Soft leaf green text
    background: '#F5F7F0',         // Natural canvas background
    cardBackground: 'rgba(254, 254, 250, 0.9)', // Glass card base
    border: 'rgba(46, 125, 50, 0.15)',          // Light leaf green border
    primary: '#2E7D32',            // Deep leaf green
    primaryLight: '#81C784',       // Young leaf green
    secondary: '#4CAF50',          // Fresh sprout green
    accent: '#FFD54F',             // Golden hour Sunlight
    accentLight: '#FFECB3',        // Morning glow
    soilBrown: '#8D6E63',          // Fertile soil brown
    error: '#C62828',              // Crimson red
    success: '#2E7D32',
    warning: '#FFA000',
    info: '#0288D1',
    tabIconDefault: '#7A9A84',
    tabIconSelected: '#2E7D32',
    shadowColor: '#2E7D32',
  },
  dark: {
    text: '#E2ECE5',               // Light green-gray text
    textSecondary: '#9CB3A4',      // Muted leaf green text
    background: '#0B140E',         // Deep charcoal forest background
    cardBackground: 'rgba(27, 44, 35, 0.85)', // Deep glass card base
    border: 'rgba(129, 199, 132, 0.2)',        // Sprout green border
    primary: '#81C784',            // Light young green
    primaryLight: '#C8E6C9',       // Misty field green
    secondary: '#4CAF50',          // Fresh sprout green
    accent: '#FFD54F',             // Golden hour Sunlight
    accentLight: '#FFF8E1',
    soilBrown: '#A1887F',
    error: '#EF5350',
    success: '#81C784',
    warning: '#FFB300',
    info: '#29B6F6',
    tabIconDefault: '#4A6051',
    tabIconSelected: '#81C784',
    shadowColor: '#000000',
  },
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

