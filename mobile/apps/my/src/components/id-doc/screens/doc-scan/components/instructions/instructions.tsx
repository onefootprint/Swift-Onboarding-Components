import { Icon } from '@onefootprint/icons';
import { Box, Typography } from '@onefootprint/ui';
import React from 'react';

type InstructionProps = {
  options: { icon: Icon; title: string; description?: string }[];
};

const Instructions = ({ options }: InstructionProps) => {
  return (
    <Box backgroundColor="secondary" padding={5} gap={6} borderRadius="default">
      {options.map(({ icon: IconComponent, title, description }) => (
        <Box gap={3} flexDirection="row" alignItems="center" key={title}>
          <Box>
            <IconComponent />
          </Box>
          <Box gap={2}>
            <Typography variant="label-3">{title}</Typography>
            {description && (
              <Typography variant="caption-4">{description}</Typography>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default Instructions;
