import { useTranslation } from 'hooks';
import React from 'react';
import { Typography } from 'ui';

const VerifySuccess = () => {
  const { t } = useTranslation('pages.verify.success');

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

export default VerifySuccess;
