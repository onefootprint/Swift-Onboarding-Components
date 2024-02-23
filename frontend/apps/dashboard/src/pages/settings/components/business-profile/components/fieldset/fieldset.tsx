import { Box, Text } from '@onefootprint/ui';
import React from 'react';

export type FieldsetProps = {
  label: string;
  value: string;
};

const Fieldset = ({ label, value }: FieldsetProps) => (
  <Box>
    <Text variant="label-3" color="tertiary" sx={{ marginBottom: 2 }}>
      {label}
    </Text>
    <Text variant="body-3">{value}</Text>
  </Box>
);

export default Fieldset;
