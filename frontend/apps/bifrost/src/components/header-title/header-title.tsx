import React from 'react';
import styled from 'styled';
import { Typography } from 'ui';

export type HeaderTitleProps = {
  title: string;
  subtitle: string;
};

const HeaderTitle = ({ title, subtitle }: HeaderTitleProps) => (
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

export default HeaderTitle;
