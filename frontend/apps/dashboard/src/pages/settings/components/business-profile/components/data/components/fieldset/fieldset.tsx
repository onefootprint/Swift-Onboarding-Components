import { IcoPencil16 } from '@onefootprint/icons';
import { Box, IconButton, LinkButton, Typography } from '@onefootprint/ui';
import React from 'react';

export type FieldsetProps = {
  addLabel: string;
  editLabel: string;
  label: string;
  value?: string | null;
};

const Fieldset = ({ label, value, editLabel, addLabel }: FieldsetProps) => (
  <Box>
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
        {label}
      </Typography>
      {value && (
        <IconButton
          aria-label={editLabel}
          onClick={() => {
            // TODO:
          }}
        >
          <IcoPencil16 />
        </IconButton>
      )}
    </Box>
    {value ? (
      <Typography variant="body-3">{value}</Typography>
    ) : (
      <LinkButton size="compact">{addLabel}</LinkButton>
    )}
  </Box>
);

export default Fieldset;
