import { Box, Text } from '@onefootprint/ui';
import type React from 'react';

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

const Field = ({ label, children }: FieldProps) => (
  <Box>
    <Text variant="label-3" color="tertiary" marginBottom={2}>
      {label}
    </Text>
    <Text variant="body-3">{children}</Text>
  </Box>
);

export default Field;
