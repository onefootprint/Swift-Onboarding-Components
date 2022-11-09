import { useTranslation } from '@onefootprint/hooks';
import React from 'react';
import styled from 'styled-components';

import HeaderTitle from '../../../../components/header-title';

const IdScanFailed = () => {
  const { t } = useTranslation('pages.id-scan-failed');
  return (
    <Container>
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default IdScanFailed;
