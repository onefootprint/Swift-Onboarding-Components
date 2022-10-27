import type { Grids } from '../types';

const grid: Grids = {
  columns: 12,
  col: {
    gutterSize: {
      xl: 16,
      lg: 16,
      md: 16,
      sm: 16,
      xs: 12,
    },
  },
  container: {
    margin: {
      xl: 40,
      lg: 40,
      md: 24,
      sm: 16,
      xs: 16,
    },
    maxWidth: {
      xl: 1280,
      lg: 1120,
      md: 852,
      sm: 552,
      xs: 0, // 100%
    },
  },
};

export default grid;
