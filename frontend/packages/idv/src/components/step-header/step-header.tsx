import React from 'react';
import styled, { css } from 'styled-components';

import HeaderTitle from '../layout/components/header-title';
import NavigationHeader from '../layout/components/navigation-header';
import type { NavigationHeaderLeftButtonProps } from '../layout/components/navigation-header/types';
import Logo from '../logo';

type HeaderProps = {
  leftButton: NavigationHeaderLeftButtonProps;
  logoUrl?: string;
  orgName?: string;
  showLogo?: boolean;
  subtitle?: string | JSX.Element;
  title: string | JSX.Element;
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
      <HeaderTitle title={title} subtitle={subtitle} />
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
