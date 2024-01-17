import { Typography } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

const Invalid = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.secure-render.invalid',
  });

  return (
    <Typography color="primary" variant="body-2" testID="invalid">
      {t('title')}
    </Typography>
  );
};

export default Invalid;
