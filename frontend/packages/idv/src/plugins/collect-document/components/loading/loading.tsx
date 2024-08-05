import { AnimatedLoadingSpinner, Box, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

type Step = 'process' | 'upload' | 'analyze';

export type LoadingProps = {
  step: Step;
  showSlowConnectionMessage?: boolean;
};

const Loading = ({ step, showSlowConnectionMessage }: LoadingProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.components.loading',
  });

  return (
    <Box display="flex" flexDirection="column" alignItems="center" padding={6}>
      <AnimatedLoadingSpinner animationStart />
      <Stack direction="column" justify="center" align="center" gap={3}>
        <Text variant="label-1" marginTop={5} textAlign="center">
          {t(`title.${step}`)}
        </Text>
        <Text variant="body-2" textAlign="center" color={showSlowConnectionMessage ? 'error' : 'secondary'}>
          {showSlowConnectionMessage ? t('slow-connection') : t('subtitle')}
        </Text>
      </Stack>
    </Box>
  );
};

export default Loading;
