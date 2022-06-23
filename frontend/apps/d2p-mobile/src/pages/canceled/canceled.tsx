import { useTranslation } from 'hooks';
import React from 'react';
import styled from 'styled-components';

import HeaderTitle from '../../components/header-title';
import useOpener from '../../hooks/use-opener';

const Canceled = () => {
  const { t } = useTranslation('pages.canceled');
  const opener = useOpener();

  return (
    <Container>
      <HeaderTitle
        title={t('title')}
        subtitle={
          opener === 'mobile' ? t('subtitle.mobile') : t('subtitle.desktop')
        }
      />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default Canceled;
