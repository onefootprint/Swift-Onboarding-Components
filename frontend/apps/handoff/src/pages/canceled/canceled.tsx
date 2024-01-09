import { useTranslation } from '@onefootprint/hooks';
import { HeaderTitle, NavigationHeader } from '@onefootprint/idv';
import styled from '@onefootprint/styled';
import { Box } from '@onefootprint/ui';
import React from 'react';

import useHandoffMachine from '../../hooks/use-handoff-machine';

const Canceled = () => {
  const [state] = useHandoffMachine();
  const { opener } = state.context;
  const { t } = useTranslation('pages.canceled');

  return (
    <Container>
      <Box>
        <NavigationHeader />
        <HeaderTitle
          title={t('title')}
          subtitle={
            opener === 'mobile' ? t('subtitle.mobile') : t('subtitle.desktop')
          }
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
