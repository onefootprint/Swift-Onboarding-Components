import React from 'react';
import styled from 'styled';
import { Typography } from 'ui';

export type HeaderProps = {
  title: string;
  subtitle: string;
};

const Header = ({ title, subtitle }: HeaderProps) => (
  <Container>
    <Typography variant="heading-2" color="primary" sx={{ marginBottom: 3 }}>
      {title}
    </Typography>
    <Typography variant="body-2" color="secondary">
      {subtitle}
    </Typography>
  </Container>
);

const Container = styled.header`
  text-align: center;
`;

export default Header;
