import styled, { css } from '@onefootprint/styled';
import { Avatar } from '@onefootprint/ui';
import React from 'react';

type LogoProps = {
  orgName: string;
  logoUrl?: string;
};

const Logo = ({ orgName, logoUrl }: LogoProps) => (
  <LogoContainer>
    <LogoBorder>
      <Avatar name={orgName} size="xlarge" src={logoUrl} />
    </LogoBorder>
  </LogoContainer>
);

const LogoContainer = styled.div`
  display: flex;
  align-content: center;
  justify-content: center;
`;

const LogoBorder = styled.div`
  ${({ theme }) => css`
    width: fit-content;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.full};
  `}
`;

export default Logo;
