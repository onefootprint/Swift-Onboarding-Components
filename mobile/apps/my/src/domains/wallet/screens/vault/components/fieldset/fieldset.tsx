import type { Icon } from '@onefootprint/icons';
import { Box, Typography } from '@onefootprint/ui';
import React from 'react';

export type FieldsetProps = {
  iconComponent: Icon;
  title: string;
  children: React.ReactNode;
};

const Fieldset = ({ title, iconComponent: IconComponent, children }: FieldsetProps) => {
  return (
    <Box borderColor="tertiary" borderRadius="default" borderWidth={1} paddingHorizontal={5} paddingVertical={7}>
      <Box marginBottom={7} gap={3} flexDirection="row" alignItems="center">
        <IconComponent />
        <Typography variant="label-2">{title}</Typography>
      </Box>
      <Box gap={7}>{children}</Box>
    </Box>
  );
};

export default Fieldset;
