import { HeaderTitle, NavigationHeader } from 'footprint-ui';
import { useTranslation } from 'hooks';
import React from 'react';

const EmailIdentificationHeader = () => {
  const { t } = useTranslation('pages.email-identification');
  return (
    <>
      <NavigationHeader button={{ variant: 'close' }} />
      <HeaderTitle
        subtitle={t('subtitle')}
        sx={{ marginBottom: 8 }}
        title={t('title')}
      />
    </>
  );
};

export default EmailIdentificationHeader;
