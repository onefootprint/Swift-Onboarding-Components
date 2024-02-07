import React from 'react';

import Stack from '../../stack';
import Typography from '../../typography';

const Hint = ({ text }: { text: string }) => (
  <Stack marginTop={2}>
    <Typography variant="caption-1" color="tertiary">
      {text}
    </Typography>
  </Stack>
);

export default Hint;
