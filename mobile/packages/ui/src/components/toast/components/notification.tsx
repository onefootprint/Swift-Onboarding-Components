import { IcoCloseSmall24, IcoInfo24, IcoWarning24 } from '@onefootprint/icons';
import React from 'react';

import Box from '../../box';
import IconButton from '../../icon-button';
import LinkButton from '../../link-button';
import Typography from '../../typography';
import type { NotificationVariants } from '../toast.types';

export type NotificationProps = {
  cta?: {
    label: string;
    onPress?: () => void;
  };
  description: string;
  onClose?: () => void;
  title: string;
  variant: NotificationVariants;
};

const Notification = ({ title, cta, description, onClose, variant }: NotificationProps) => {
  return (
    <Box backgroundColor="primary" marginHorizontal={3} marginTop={10} padding={4} elevation={2} borderRadius="default">
      <Box marginBottom={2} flexDirection="row" alignItems="center">
        <Box flexDirection="row" alignItems="center" gap={3} flexGrow={1}>
          {variant === 'error' && <IcoWarning24 color="error" />}
          {variant === 'info' && <IcoInfo24 />}
          <Typography variant="label-3" color={variant}>
            {title}
          </Typography>
        </Box>
        <IconButton onPress={onClose} aria-label="Close">
          <IcoCloseSmall24 />
        </IconButton>
      </Box>
      <Box marginLeft={7}>
        <Typography variant="body-3" color="tertiary">
          {description}
        </Typography>
      </Box>
      {cta && (
        <Box marginLeft={7} marginTop={3} flexDirection="row">
          <LinkButton size="compact" onPress={cta.onPress}>
            {cta.label}
          </LinkButton>
        </Box>
      )}
    </Box>
  );
};

export default Notification;
