import { HeaderTitle, NavigationHeader } from '@onefootprint/idv';
import { Box } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import useHandoffMachine from '../../hooks/use-handoff-machine';

const Canceled = () => {
  const [state] = useHandoffMachine();
  const { opener } = state.context;
  const { t } = useTranslation('common', { keyPrefix: 'pages.canceled' });

  return (
    <Container>
      <Box>
        <NavigationHeader />
        <HeaderTitle title={t('title')} subtitle={opener === 'mobile' ? t('subtitle.mobile') : t('subtitle.desktop')} />
      </Box>
    </Container>
  );
};

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  text-align: center;
`;

export default Canceled;
