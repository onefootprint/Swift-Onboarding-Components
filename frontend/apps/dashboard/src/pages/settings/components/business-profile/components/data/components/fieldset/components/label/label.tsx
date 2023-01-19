import { IcoPencil16 } from '@onefootprint/icons';
import { Box, IconButton, Typography } from '@onefootprint/ui';
import React from 'react';

export type LabelProps = {
  children: string;
  cta?: {
    label: string;
    onClick: () => void;
  };
};

const Label = ({ children, cta }: LabelProps) => (
  <Box
    sx={{
      alignItems: 'center',
      display: 'flex',
      gap: 3,
      height: '32px',
      marginBottom: 2,
    }}
  >
    <Typography variant="label-3" color="tertiary">
      {children}
    </Typography>
    {cta && (
      <IconButton aria-label={cta.label} onClick={cta.onClick}>
        <IcoPencil16 />
      </IconButton>
    )}
  </Box>
);
export default Label;
