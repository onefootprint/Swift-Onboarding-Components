import type { Icon } from '@onefootprint/icons';
import React from 'react';

import Box from '../box';
import Button from '../button';
import Typography from '../typography';

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

const EmptyState = ({
  cta,
  description,
  iconComponent: Icon,
  renderHeader,
  title,
  testID,
}: EmptyStateProps) => (
  <Box
    testID={testID}
    sx={{
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      textAlign: 'center',
    }}
  >
    {Icon && (
      <Box sx={{ marginBottom: 7 }}>
        <Icon color="error" />
      </Box>
    )}
    {renderHeader && <Box sx={{ marginBottom: 9 }}>{renderHeader()}</Box>}
    <Typography variant="label-1" sx={{ marginBottom: 4 }}>
      {title}
    </Typography>
    <Typography variant="body-2" color="secondary">
      {description}
    </Typography>
    {cta && (
      <Button onClick={cta.onClick} sx={{ marginTop: 8 }}>
        {cta.label}
      </Button>
    )}
  </Box>
);

export default EmptyState;
