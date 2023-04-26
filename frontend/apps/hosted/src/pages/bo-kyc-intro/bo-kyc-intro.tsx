import { useTranslation } from '@onefootprint/hooks';
import {
  HeaderTitle,
  Layout,
  useLayoutOptions,
} from '@onefootprint/idv-elements';
import { UserDataAttribute } from '@onefootprint/types';
import { Avatar, Button } from '@onefootprint/ui';
import React from 'react';
import useHostedMachine from 'src/hooks/use-hosted-machine';
import styled, { css } from 'styled-components';

const BoKycIntro = () => {
  const { t } = useTranslation('pages.bo-kyc-intro');
  const { layout } = useLayoutOptions();
  const [state, send] = useHostedMachine();
  const { businessBoKycData, onboardingConfig } = state.context;
  const { inviter } = businessBoKycData || {};
  const otherBoName = [
    inviter?.[UserDataAttribute.firstName],
    inviter?.[UserDataAttribute.lastName],
  ].join(' ');
  const businessName = onboardingConfig?.orgName ?? '';

  const handleClick = () => {
    send({
      type: 'introductionCompleted',
    });
  };

  return (
    <Layout tenantPk={onboardingConfig?.key} options={layout}>
      <Container>
        <HeaderContainer>
          <Avatar
            name={businessName}
            size="large"
            src={onboardingConfig?.logoUrl}
          />
          <HeaderTitle
            title={t('title')}
            subtitle={t('subtitle', {
              otherBoName,
              businessName,
            })}
            sx={{ marginTop: 4 }}
          />
        </HeaderContainer>
        <Button fullWidth onClick={handleClick}>
          {t('cta')}
        </Button>
      </Container>
    </Layout>
  );
};

const HeaderContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[5]};
    justify-content: center;
    align-items: center;
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[7]};
    justify-content: center;
    align-items: center;
  `}
`;

export default BoKycIntro;
