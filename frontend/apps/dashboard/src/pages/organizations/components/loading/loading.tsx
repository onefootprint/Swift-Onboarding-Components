import { Box, LoadingIndicator, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

const Loading = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.organizations' });

  return (
    <Box testID="organizations-loading" sx={{ width: '100%' }}>
      <Text
        variant="label-1"
        color="primary"
        sx={{ marginTop: 8, marginBottom: 6, textAlign: 'center' }}
      >
        {t('title')}
      </Text>
      <LoadingIndicator />
    </Box>
  );
};

export default Loading;
