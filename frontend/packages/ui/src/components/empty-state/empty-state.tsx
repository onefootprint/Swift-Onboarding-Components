import React from 'react';

import Box from '../box';
import Button from '../button';
import Typography from '../typography';

export type EmptyStateProps = {
  title: string;
  description: string;
  cta?: {
    label: string;
    onClick: () => void;
  };
  renderImage?: () => React.ReactNode;
};

const EmptyState = ({
  title,
  description,
  cta,
  renderImage,
}: EmptyStateProps) => (
  <Box
    sx={{
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      textAlign: 'center',
    }}
  >
    {renderImage && <Box sx={{ marginBottom: 9 }}>{renderImage()}</Box>}
    <Typography variant="heading-3" sx={{ marginBottom: 5 }}>
      {title}
    </Typography>
    <Typography variant="body-1" color="secondary">
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
