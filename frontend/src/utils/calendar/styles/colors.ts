/**
 * Calendar color system — exact values from the current implementation.
 * CRITICAL: do not modify without visual verification.
 */
export const CALENDAR_COLORS = {
  // Primary green variations
  primaryGreen: '#059669',
  primaryGreenDark: '#065f46',
  primaryGreenLight: '#10b981',
  primaryGreenBg: 'rgba(6,78,59,0.1)',

  // Secondary colors
  secondaryPurple: '#ddb7ff',
  secondaryPurpleBg: 'rgba(111,0,190,0.1)',

  // Critical colors
  criticalGreen: '#a7f3d0',
  criticalGreenBg: 'rgba(6,78,59,0.6)',
  criticalBorder: 'rgba(6,95,70,0.3)',

  // Inactive colors
  inactiveGray: '#6b7280',
  inactiveBg: '#1c1b1b',
  inactiveBorder: 'rgba(59,75,53,0.15)',

  // Background colors
  darkBackground: '#0e0e0e',
  lightText: '#e5e2e1',
  mutedText: '#6b7280',

  // Today highlighting
  todayBg: 'rgba(2,44,34,0.08)',
  todayBorder: 'rgba(6,78,59,0.2)',
  todayBorderStrong: 'rgba(6,78,59,0.4)',

  // Weekend colors
  weekendText: '#8b7355',
  weekendTextLight: '#c4b59a',

  // Grid lines
  gridBorder: 'rgba(59,75,53,0.15)',
  gridBorderLight: 'rgba(59,75,53,0.08)',
} as const
