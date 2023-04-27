import { useTranslation } from '@onefootprint/hooks';
import { HeaderTitle } from '@onefootprint/idv-elements';
import { UserDataAttribute } from '@onefootprint/types';
import { Avatar } from '@onefootprint/ui';
import React from 'react';
import useHostedMachine from 'src/hooks/use-hosted-machine';
import styled, { css } from 'styled-components';

import useIsKyb from '../../utils/is-kyb';

const Header = () => {
  const { t } = useTranslation('pages.intro.header');
  const [state] = useHostedMachine();
  const { businessBoKycData, onboardingConfig } = state.context;
  const isKyb = useIsKyb();

  const { name: businessName, inviter } = businessBoKycData || {};
  const otherBoName = [
    inviter?.[UserDataAttribute.firstName],
    inviter?.[UserDataAttribute.lastName],
  ].join(' ');
  const tenantName = onboardingConfig?.orgName ?? '';

  return (
    <HeaderContainer>
      <Avatar name={tenantName} size="large" src={onboardingConfig?.logoUrl} />
      {businessBoKycData ? (
        <HeaderTitle
          title={t('bo-kyc.title', { tenantName })}
          subtitle={t('bo-kyc.subtitle', {
            otherBoName,
            businessName,
          })}
          sx={{ marginTop: 4 }}
        />
      ) : (
        <HeaderTitle
          title={
            isKyb
              ? t('kyb.title', { tenantName })
              : t('kyc.title', { tenantName })
          }
          subtitle={
            isKyb
              ? t('kyb.subtitle', { tenantName })
              : t('kyc.subtitle', { tenantName })
          }
          sx={{ marginTop: 4 }}
        />
      )}
    </HeaderContainer>
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

export default Header;
