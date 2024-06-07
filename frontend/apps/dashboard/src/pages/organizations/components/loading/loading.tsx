import { AnimatedLoadingSpinner, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

const Loading = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.organizations' });

  return (
    <Stack testID="organizations-loading" center direction="column">
      <Text variant="label-1" color="primary" marginTop={8} marginBottom={6} textAlign="center">
        {t('title')}
      </Text>
      <AnimatedLoadingSpinner animationStart />
    </Stack>
  );
};

export default Loading;
