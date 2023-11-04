import React from 'react';

import Box from '../../box';
import LinkButton from '../../link-button';
import Typography from '../../typography';

type EmptyStateProps = {
  title: string;
  cta: {
    label: string;
    onPress: () => void;
  };
};

const EmptyState = ({ title, cta }: EmptyStateProps) => {
  return (
    <Box gap={3} center marginTop={12}>
      <Typography variant="body-3">{title}</Typography>
      <LinkButton onPress={cta.onPress}>{cta.label}</LinkButton>
    </Box>
  );
};

export default EmptyState;
