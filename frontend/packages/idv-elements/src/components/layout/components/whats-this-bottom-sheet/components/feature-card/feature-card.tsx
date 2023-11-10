import type { Icon } from '@onefootprint/icons';
import { Stack, Typography } from '@onefootprint/ui';
import React from 'react';

type FeatureCardProps = {
  title: string;
  subtitle: string;
  icon: Icon;
};

const FeatureCard = ({ title, subtitle, icon: Icon }: FeatureCardProps) => {
  const renderedIcon = Icon && <Icon color="primary" />;
  return (
    <Stack
      direction="column"
      gap={3}
      paddingTop={4}
      paddingBottom={4}
      paddingLeft={5}
      paddingRight={5}
      backgroundColor="secondary"
      borderRadius="default"
    >
      <Stack direction="row" gap={3} align="center" justify="start">
        {renderedIcon}
        <Typography variant="label-4">{title}</Typography>
      </Stack>
      <Typography variant="body-4" color="secondary">
        {subtitle}
      </Typography>
    </Stack>
  );
};

export default FeatureCard;
