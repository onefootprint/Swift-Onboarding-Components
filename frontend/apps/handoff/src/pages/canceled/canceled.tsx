import { HeaderTitle, NavigationHeader } from '@onefootprint/idv';
import styled from '@onefootprint/styled';
import { Box } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import useHandoffMachine from '../../hooks/use-handoff-machine';

const Canceled = () => {
  const [state] = useHandoffMachine();
  const { opener } = state.context;
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.canceled.subtitle',
  });

  return (
    <Container>
      <Box>
        <NavigationHeader />
        <HeaderTitle
          title={t('title')}
          subtitle={opener === 'mobile' ? t('mobile') : t('desktop')}
        />
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
