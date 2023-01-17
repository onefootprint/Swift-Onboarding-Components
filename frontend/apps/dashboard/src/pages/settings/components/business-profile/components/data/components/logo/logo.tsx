import { useTranslation } from '@onefootprint/hooks';
import { Organization } from '@onefootprint/types';
import { Avatar, LinkButton } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type LogoProps = {
  organization: Organization;
};

const Logo = ({ organization }: LogoProps) => {
  const { t } = useTranslation('pages.settings.business-profile');

  return (
    <LogoContainer>
      <Avatar
        name={organization.name}
        size="large"
        src={organization.logoUrl}
      />
      <LinkButton size="compact" onClick={() => {}}>
        {t('logo.change')}
      </LinkButton>
    </LogoContainer>
  );
};

const LogoContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[5]};
  `}
`;

export default Logo;
