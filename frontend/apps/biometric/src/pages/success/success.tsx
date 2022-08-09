import useCountdown from 'footprint-ui/src/hooks/use-countdown';
import { useTranslation } from 'hooks';
import React, { useEffect } from 'react';

import HeaderTitle from '../../components/header-title';
import useOpener from '../../hooks/use-opener';

const SUCCESS_COUNTER_SECONDS = 3;

const Success = () => {
  const { t } = useTranslation('pages.success');
  const opener = useOpener();
  const shouldShowCounter = opener === 'mobile';
  const { countdown, setSeconds } = useCountdown({
    disabled: !shouldShowCounter,
    onCompleted: () => window.close(),
  });

  useEffect(() => {
    setSeconds(SUCCESS_COUNTER_SECONDS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <HeaderTitle
      title={t('title')}
      subtitle={
        shouldShowCounter
          ? t('subtitle.with-countdown', { seconds: countdown })
          : t('subtitle.without-countdown')
      }
    />
  );
};

export default Success;
