import React from 'react';
import type { Colors } from 'styled';

import Box from '../../box';
import Typography from '../../typography';

export type HintProps = {
  children: string;
  color: Colors;
};

const Hint = ({ children, color }: HintProps) => (
  <Box sx={{ marginTop: 3 }}>
    <Typography as="p" color={color} variant="caption-1">
      {children}
    </Typography>
  </Box>
);

export default Hint;
