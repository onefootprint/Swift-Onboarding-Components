import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Button } from '@onefootprint/ui';
import React from 'react';
import useHostedMachine from 'src/hooks/use-hosted-machine';

import Header from './components/header';
import useIsKyb from './utils/is-kyb';

const Intro = () => {
  const { t } = useTranslation('pages.intro');
  const [, send] = useHostedMachine();
  const isKyb = useIsKyb();

  const handleClick = () => {
    send({
      type: 'introductionCompleted',
    });
  };

  return (
    <Container>
      <Header />
      <Button fullWidth onClick={handleClick}>
        {isKyb ? t('cta.kyb') : t('cta.kyc')}
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
