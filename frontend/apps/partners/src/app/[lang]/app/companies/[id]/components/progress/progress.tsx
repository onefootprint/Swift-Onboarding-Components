import { Box, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type ProgressProps = {
  value: number;
  details: string;
};

const Progress = ({ details, value }: ProgressProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'companies' });

  return (
    <Stack backgroundColor="secondary" borderRadius="sm" direction="column" gap={4} padding={5} width="100%">
      <Stack gap={3} justify="space-between" width="100%">
        <Text variant="label-3" color="secondary">
          {`${value.toFixed(0)}${t('percentage-completed')}`}
        </Text>
        <Text variant="label-4" color="tertiary">
          {details}
        </Text>
      </Stack>
      <Box position="relative" height="8px" width="100%">
        <Bar backgroundColor="tertiary" opacity="0.2" width="100%" />
        <Bar backgroundColor="successInverted" width={`${value}%`} zIndex={1} />
      </Box>
    </Stack>
  );
};

const Bar = styled(Box)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.full};
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
  `};
`;

export default Progress;
