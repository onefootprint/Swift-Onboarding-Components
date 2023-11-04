import { IcoInfo16 } from '@onefootprint/icons';
import React from 'react';

import Box from '../box';
import Typography from '../typography';

export type InlineAlertProps = {
  children: string;
};

const InlineAlert = ({ children }: InlineAlertProps) => {
  return (
    <Box
      alignItems="center"
      backgroundColor="warning"
      borderRadius="default"
      flexDirection="row"
      gap={3}
      paddingHorizontal={5}
      paddingVertical={4}
    >
      <IcoInfo16 color="warning" />
      <Typography variant="body-3" color="warning">
        {children}
      </Typography>
    </Box>
  );
};

export default InlineAlert;
