const colors = require('tailwindcss/colors');

function themed(name, hex) {
  const channels = hex.slice(1).match(/../g).map(channel => parseInt(channel, 16)).join(' ');
  return `rgb(var(--portal-${name}, ${channels}) / <alpha-value>)`;
}

function palette(name, shades) {
  return Object.fromEntries(shades.map(shade => [shade, themed(`${name}-${shade}`, colors[name][shade])]));
}

module.exports = {
  content: ['./src/app/features/portal-alumno/**/*.{html,ts,json}', './src/app/shared/{portal-art,mystic-pattern}.{html,ts}'],
  theme: {
    extend: {
      colors: {
        white: themed('white', '#ffffff'),
        slate: palette('slate', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]),
        amber: palette('amber', [50, 200, 700]),
        green: palette('green', [50, 100, 200, 700]),
        red: palette('red', [50, 100, 200, 600, 700]),
      },
      // These colors also appear on filled buttons, overlays and image backgrounds.
      textColor: { white: colors.white },
      backgroundColor: { slate: { 900: colors.slate[900] }, red: { 600: colors.red[600], 700: colors.red[700] } },
    },
  },
  plugins: [],
};
