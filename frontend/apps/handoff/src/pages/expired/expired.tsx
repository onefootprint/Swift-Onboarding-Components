import { useTranslation } from '@onefootprint/hooks';
import { HeaderTitle, NavigationHeader } from '@onefootprint/idv';
import styled from '@onefootprint/styled';
import { Box, Button, Grid } from '@onefootprint/ui';
import React from 'react';

import useHandoffMachine from '../../hooks/use-handoff-machine';

const Expired = () => {
  const { t } = useTranslation('pages.expired');
  const [state] = useHandoffMachine();
  const { opener } = state.context;

  const handleClick = () => {
    window.close();
  };

  return (
    <Container>
      <Box>
        <NavigationHeader />
        <Grid.Container as="form" gap={8}>
          <HeaderTitle
            title={t('title')}
            subtitle={
              opener === 'mobile' ? t('subtitle.mobile') : t('subtitle.desktop')
            }
          />
          {opener === 'mobile' && (
            <Button onClick={handleClick} fullWidth>
              {t('cta')}
            </Button>
          )}
        </Grid.Container>
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

export default Expired;
