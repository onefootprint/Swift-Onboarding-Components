import type { Grid } from 'styled';

const grid: Grid = {
  gridColumns: 12,
  col: {
    gutterSize: {
      xl: 24,
      lg: 24,
      md: 24,
      sm: 16,
      xs: 12,
    },
  },
  container: {
    margin: {
      xl: 40,
      lg: 40,
      md: 40,
      sm: 24,
      xs: 16,
    },
    maxWidth: {
      xl: 1280,
      lg: 1024,
      md: 0, // 100%
      sm: 0, // 100%
      xs: 0, // 100%
    },
  },
};

export default grid;
