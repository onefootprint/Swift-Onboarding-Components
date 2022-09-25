import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import HeaderTitle from '../../components/header-title';
import useOpener from '../../hooks/use-opener';

const Canceled = () => {
  const { t } = useTranslation('pages.canceled');
  const opener = useOpener();

  return (
    <HeaderTitle
      title={t('title')}
      subtitle={
        opener === 'mobile' ? t('subtitle.mobile') : t('subtitle.desktop')
      }
    />
  );
};

export default Canceled;
