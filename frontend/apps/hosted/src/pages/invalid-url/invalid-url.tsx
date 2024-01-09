import { useTranslation } from '@onefootprint/hooks';
import { HeaderTitle } from '@onefootprint/idv';
import { Box } from '@onefootprint/ui';
import React from 'react';

const InvalidUrl = () => {
  const { t } = useTranslation('pages.invalid-url');
  return (
    <Box paddingTop={8}>
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
    </Box>
  );
};

export default InvalidUrl;
