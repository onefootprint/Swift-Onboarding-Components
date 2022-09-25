import { useTranslation } from '@onefootprint/hooks';
import React from 'react';
import { Typography } from 'ui';

const VerifyError = () => {
  const { t } = useTranslation('pages.verify.error');

  return (
    <>
      <Typography color="primary" variant="heading-3" sx={{ marginBottom: 5 }}>
        {t('title')}
      </Typography>
      <Typography color="secondary" variant="body-2">
        {t('description')}
      </Typography>
    </>
  );
};

export default VerifyError;
