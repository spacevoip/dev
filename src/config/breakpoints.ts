export const breakpoints = {
  sm: '640px',   // Telas pequenas
  md: '768px',   // Tablets
  lg: '1024px',  // Desktop pequeno
  xl: '1280px',  // Desktop médio
  '2xl': '1536px' // Desktop grande
} as const;

export const minWidth = {
  sm: `(min-width: ${breakpoints.sm})`,
  md: `(min-width: ${breakpoints.md})`,
  lg: `(min-width: ${breakpoints.lg})`,
  xl: `(min-width: ${breakpoints.xl})`,
  '2xl': `(min-width: ${breakpoints['2xl']})`
} as const;
