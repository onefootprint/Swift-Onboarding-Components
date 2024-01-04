import styled, { css } from '@onefootprint/styled';
import React from 'react';

import HeaderTitle from '../layout/components/header-title';
import NavigationHeader from '../layout/components/navigation-header';
import type { NavigationHeaderLeftButtonProps } from '../layout/components/navigation-header/types';
import Logo from '../logo';

type HeaderProps = {
  leftButton: NavigationHeaderLeftButtonProps;
  logoUrl?: string;
  orgName?: string;
  showLogo?: boolean;
  subtitle?: string;
  title: string;
};

const StepHeader = ({
  leftButton,
  logoUrl,
  orgName,
  showLogo,
  subtitle,
  title,
}: HeaderProps) => (
  <>
    <NavigationHeader leftButton={leftButton} />
    <ContentHeader>
      {showLogo && orgName ? (
        <Logo orgName={orgName} logoUrl={logoUrl} />
      ) : null}
      <HeaderTitle title={title} subtitle={subtitle} sx={{ marginBottom: 8 }} />
    </ContentHeader>
  </>
);

const ContentHeader = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
  `}
`;

export default StepHeader;
