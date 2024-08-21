import { Text } from '@onefootprint/ui';
import type React from 'react';

export type FieldProps = {
  label: string;
  children: React.ReactNode;
};

const Field = ({ label, children }: FieldProps) => (
  <div role="row" aria-label={label}>
    <Text variant="label-3" color="tertiary" marginBottom={3} tag="div">
      {label}
    </Text>
    <Text variant="body-3" tag="div">
      {children}
    </Text>
  </div>
);

export default Field;
