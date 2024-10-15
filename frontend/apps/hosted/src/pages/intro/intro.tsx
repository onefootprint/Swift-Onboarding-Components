import { Button } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useHostedMachine from 'src/hooks/use-hosted-machine';
import styled, { css } from 'styled-components';

import Header from './components/header';
import useIsKyb from './utils/is-kyb';

const Intro = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.intro' });
  const [, send] = useHostedMachine();
  const _isKyb = useIsKyb();

  const handleClick = () => {
    send({ type: 'introductionCompleted' });
  };

  return (
    <Container>
      <Header />
      <Button fullWidth onClick={handleClick} size="large">
        {t('cta')}
      </Button>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[7]};
    justify-content: center;
    align-items: center;
    padding-top: ${theme.spacing[8]};
  `}
`;

export default Intro;
