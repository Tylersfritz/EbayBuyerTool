
import plugin from 'tailwindcss/plugin';

export const shadcnPlugin = plugin(
  ({ addBase, addComponents, addUtilities, addVariant, e, config }) => {
    addBase({
      ':root': {
        '--radius': '0.5rem',
      },
      // Add base font styles
      'html': {
        fontFamily: 'Inter, sans-serif',
        fontDisplay: 'swap',
      },
    });
    
    addUtilities({
      '.variant-primary': {
        '@apply bg-gradient-to-r from-primary to-primary-600 text-primary-foreground': {},
      },
      '.variant-premium': {
        '@apply bg-gradient-to-r from-blue-600 to-violet-500 text-white': {},
      },
      // Add specific font utilities
      '.font-display': {
        fontFamily: '"Playfair Display", serif',
      },
    });
    
    addComponents({
      '.button-premium': {
        '@apply bg-gradient-to-r from-blue-600 to-violet-500 text-white hover:from-blue-700 hover:to-violet-600 transition-all': {},
      },
    });
    
    // Add variants
    addVariant('premium', '&.premium');
    addVariant('active-premium', '.premium&');
  },
);

export default shadcnPlugin;
