import { useTranslation } from '@onefootprint/hooks';
import { HeaderTitle } from '@onefootprint/idv-elements';
import React from 'react';

const InvalidUrl = () => {
  const { t } = useTranslation('pages.invalid-url');
  return <HeaderTitle title={t('title')} subtitle={t('subtitle')} />;
};

export default InvalidUrl;
