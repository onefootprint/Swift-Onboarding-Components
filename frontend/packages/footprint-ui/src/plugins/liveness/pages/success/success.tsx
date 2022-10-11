import { useTranslation } from '@onefootprint/hooks';
import React from 'react';
import { useEffectOnce } from 'usehooks-ts';

import HeaderTitle from '../../components/header-title';
import { useLivenessMachine } from '../../components/machine-provider';
import { Events } from '../../utils/state-machine/types';

const TRANSITION_DELAY = 3000;

const Success = () => {
  const { t } = useTranslation('pages.success');
  const [, send] = useLivenessMachine();

  useEffectOnce(() => {
    setTimeout(() => {
      send({
        type: Events.completed,
      });
    }, TRANSITION_DELAY);
  });

  return <HeaderTitle title={t('title')} subtitle={t('subtitle')} />;
};

export default Success;
