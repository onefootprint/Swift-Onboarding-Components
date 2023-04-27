import { useTranslation } from '@onefootprint/hooks';
import { Layout, useLayoutOptions } from '@onefootprint/idv-elements';
import { Button } from '@onefootprint/ui';
import React from 'react';
import useHostedMachine from 'src/hooks/use-hosted-machine';
import styled, { css } from 'styled-components';

import Header from './components/header';
import useIsKyb from './utils/is-kyb';

const Intro = () => {
  const { t } = useTranslation('pages.intro');
  const { layout } = useLayoutOptions();
  const [state, send] = useHostedMachine();
  const { onboardingConfig } = state.context;
  const isKyb = useIsKyb();

  const handleClick = () => {
    send({
      type: 'introductionCompleted',
    });
  };

  return (
    <Layout tenantPk={onboardingConfig?.key} options={layout}>
      <Container>
        <Header />
        <Button fullWidth onClick={handleClick}>
          {isKyb ? t('cta.kyb') : t('cta.kyc')}
        </Button>
      </Container>
    </Layout>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[7]};
    justify-content: center;
    align-items: center;
  `}
`;

export default Intro;
