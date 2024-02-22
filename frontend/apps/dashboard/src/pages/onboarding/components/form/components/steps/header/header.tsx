import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

export type HeaderProps = {
  title: string;
  subtitle: string;
};

const Header = ({ title, subtitle }: HeaderProps) => (
  <Container>
    <Typography variant="heading-3" sx={{ marginBottom: 3 }}>
      {title}
    </Typography>
    <Typography variant="body-2" color="secondary">
      {subtitle}
    </Typography>
  </Container>
);

const Container = styled.header`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[8]};
  `}
`;

export default Header;
