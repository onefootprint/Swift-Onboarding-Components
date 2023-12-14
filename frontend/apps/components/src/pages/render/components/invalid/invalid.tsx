import { useTranslation } from '@onefootprint/hooks';
import { Typography } from '@onefootprint/ui';
import React from 'react';

const Invalid = () => {
  const { t } = useTranslation('pages.secure-render.invalid');

  return (
    <Typography color="primary" variant="body-2" testID="invalid">
      {t('title')}
    </Typography>
  );
};

export default Invalid;
