import { useTranslation } from '@onefootprint/hooks';
import { LoadingIndicator, Typography } from '@onefootprint/ui';
import React from 'react';

const Loading = () => {
  const { t } = useTranslation('pages.processing-documents');

  return (
    <>
      <LoadingIndicator />
      <Typography variant="label-3">{t('loading')}</Typography>
    </>
  );
};

export default Loading;
