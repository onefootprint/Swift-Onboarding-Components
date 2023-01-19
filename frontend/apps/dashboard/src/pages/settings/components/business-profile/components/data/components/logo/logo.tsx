import { useTranslation } from '@onefootprint/hooks';
import { Organization } from '@onefootprint/types';
import { Avatar, LinkButton } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type LogoProps = {
  organization: Organization;
};

const Logo = ({ organization }: LogoProps) => {
  const { t } = useTranslation('pages.settings.business-profile.logo');

  return (
    <LogoContainer>
      <Avatar
        name={organization.name}
        size="large"
        src={organization.logoUrl}
      />
      <ButtonContainer>
        <LinkButton size="compact" onClick={() => {}}>
          {t('cta')}
        </LinkButton>
      </ButtonContainer>
    </LogoContainer>
  );
};

const LogoContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[5]};
  `}
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default Logo;
