import { Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

const VerifyError = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.verify.error' });

  return (
    <>
      <Text color="primary" variant="heading-3" sx={{ marginBottom: 5 }}>
        {t('title')}
      </Text>
      <Text color="secondary" variant="body-2">
        {t('description')}
      </Text>
    </>
  );
};

export default VerifyError;
