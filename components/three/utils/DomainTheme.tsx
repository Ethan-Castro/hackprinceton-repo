/**
 * Domain Theme Configuration for Three.js Animations
 * Maps each domain to its visual identity (colors, icons, etc.)
 */

export type DomainType = 'business' | 'health' | 'education' | 'sustainability';

export interface DomainTheme {
  primary: string;        // Main hex color
  secondary: string;      // Secondary/lighter color
  particleColor: string;  // Particle stream color
  ringColor: string;      // Expanding rings color
  glowColor: string;      // Emissive glow color
  icon: string;          // Icon name from lucide-react
}

export const domainThemes: Record<DomainType, DomainTheme> = {
  business: {
    primary: '#3b82f6',      // blue-500
    secondary: '#60a5fa',    // blue-400
    particleColor: '#60a5fa', // blue-400
    ringColor: '#93c5fd',    // blue-300
    glowColor: '#3b82f6',    // blue-500
    icon: 'Briefcase',
  },
  health: {
    primary: '#ef4444',      // red-500
    secondary: '#f87171',    // red-400
    particleColor: '#f87171', // red-400
    ringColor: '#fca5a5',    // red-300
    glowColor: '#ef4444',    // red-500
    icon: 'Heart',
  },
  education: {
    primary: '#6366f1',      // indigo-500
    secondary: '#818cf8',    // indigo-400
    particleColor: '#818cf8', // indigo-400
    ringColor: '#a5b4fc',    // indigo-300
    glowColor: '#6366f1',    // indigo-500
    icon: 'GraduationCap',
  },
  sustainability: {
    primary: '#10b981',      // emerald-500
    secondary: '#34d399',    // emerald-400
    particleColor: '#34d399', // emerald-400
    ringColor: '#6ee7b7',    // emerald-300
    glowColor: '#10b981',    // emerald-500
    icon: 'Leaf',
  },
};

/**
 * Get theme for a specific domain
 */
export function getDomainTheme(domain: DomainType): DomainTheme {
  return domainThemes[domain];
}

/**
 * Convert hex color to THREE.Color-compatible number
 */
export function hexToNumber(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}
