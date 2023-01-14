import { Divider, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type HeaderProps = {
  title: string;
};

const Header = ({ title }: HeaderProps) => (
  <>
    <TitleContainer>
      <Typography as="h2" variant="label-1">
        {title}
      </Typography>
    </TitleContainer>
    <StyledDivider />
  </>
);

const TitleContainer = styled.header`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[3]};
  `}
`;

const StyledDivider = styled(Divider)`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[7]};
  `}
`;

export default Header;
