import { useTranslation } from 'hooks';
import React from 'react';
import styled from 'styled-components';

import HeaderTitle from '../../components/header-title';
import useOpener from '../../hooks/use-opener';
import useCountdown from './hooks/use-countdown';

const Success = () => {
  const { t } = useTranslation('pages.success');
  const opener = useOpener();
  const shouldShowCounter = opener === 'mobile';
  const seconds = useCountdown({
    disabled: shouldShowCounter,
    onCompleted: () => window.close(),
  });

  return (
    <Container>
      <HeaderTitle
        title={t('title')}
        subtitle={
          shouldShowCounter
            ? t('subtitle.with-countdown', { seconds })
            : t('subtitle.without-countdown')
        }
      />
    </Container>
  );
};

const Container = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`;

export default Success;
