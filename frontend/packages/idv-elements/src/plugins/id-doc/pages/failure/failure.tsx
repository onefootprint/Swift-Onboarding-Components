import { useTranslation } from '@onefootprint/hooks';
import React from 'react';
import styled from 'styled-components';

import { HeaderTitle, NavigationHeader } from '../../../../components';

const Failure = () => {
  const { t } = useTranslation('pages.failure');
  return (
    <Container>
      <NavigationHeader />
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default Failure;
