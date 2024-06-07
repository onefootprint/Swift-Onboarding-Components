import type { Icon } from '@onefootprint/icons';
import React from 'react';

import Box from '../box';
import Button from '../button';
import Stack from '../stack';
import Text from '../text';

type OnlyIcon = {
  iconComponent: Icon;
  renderHeader?: never;
};

type OnlyImage = {
  iconComponent?: never;
  renderHeader: () => React.ReactNode;
};

type NoIconOrImage = {
  iconComponent?: never;
  renderHeader?: never;
};

export type EmptyStateProps = {
  cta?: { label: string; onClick: () => void };
  description: string;
  title: string;
  testID?: string;
} & (OnlyIcon | OnlyImage | NoIconOrImage);

const EmptyState = ({ cta, description, iconComponent: Icon, renderHeader, title, testID }: EmptyStateProps) => (
  <Stack data-testid={testID} align="center" justify="center" direction="column">
    {Icon && (
      <Box marginBottom={7}>
        <Icon color="error" />
      </Box>
    )}
    {renderHeader && <Box marginBottom={7}>{renderHeader()}</Box>}
    <Text variant="label-1" marginBottom={4}>
      {title}
    </Text>
    <Text variant="body-2" color="secondary" textAlign="center">
      {description}
    </Text>
    {cta && (
      <Box marginTop={8}>
        <Button onClick={cta.onClick} variant="primary" size="large" fullWidth>
          {cta.label}
        </Button>
      </Box>
    )}
  </Stack>
);

export default EmptyState;
