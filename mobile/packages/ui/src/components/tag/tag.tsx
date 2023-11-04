import React from 'react';

import Box from '../box';
import Typography from '../typography';

export type TagProps = {
  children: string;
};

const Tag = ({ children }: TagProps) => {
  return (
    <Box
      aria-label={children}
      borderColor="primary"
      borderRadius="large"
      borderStyle="solid"
      borderWidth={1}
      paddingHorizontal={3}
      paddingVertical={2}
    >
      <Typography variant="caption-2">{children}</Typography>
    </Box>
  );
};

export default Tag;
