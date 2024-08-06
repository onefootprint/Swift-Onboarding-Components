import { HeaderTitle, NavigationHeader } from '@onefootprint/idv';
import { Box, Button, Grid } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import useHandoffMachine from '../../hooks/use-handoff-machine';

const Expired = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.expired' });
  const [state] = useHandoffMachine();
  const { opener } = state.context;

  const handleClick = () => {
    window.close();
  };

  return (
    <Container>
      <Box>
        <NavigationHeader />
        <Grid.Container tag="form" gap={8}>
          <HeaderTitle
            title={t('title')}
            subtitle={opener === 'mobile' ? t('subtitle.mobile') : t('subtitle.desktop')}
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
