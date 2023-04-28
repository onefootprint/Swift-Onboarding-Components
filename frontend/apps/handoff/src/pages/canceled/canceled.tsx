import { useTranslation } from '@onefootprint/hooks';
import { HeaderTitle, NavigationHeader } from '@onefootprint/idv-elements';
import React from 'react';

import useHandoffMachine from '../../hooks/use-handoff-machine/use-handoff-machine';

const Canceled = () => {
  const [state] = useHandoffMachine();
  const { opener } = state.context;
  const { t } = useTranslation('pages.canceled');

  return (
    <>
      <NavigationHeader />
      <HeaderTitle
        title={t('title')}
        subtitle={
          opener === 'mobile' ? t('subtitle.mobile') : t('subtitle.desktop')
        }
      />
    </>
  );
};

export default Canceled;
