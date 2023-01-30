import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import HeaderTitle from '../../components/header-title';
import useHandoffMachine from '../../hooks/use-handoff-machine/use-handoff-machine';

const Canceled = () => {
  const [state] = useHandoffMachine();
  const { opener } = state.context;
  const { t } = useTranslation('pages.canceled');

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
