import React from 'react';
import styled from 'styled-components';
import { Typography } from 'ui';

export type HeaderTitleProps = {
  title: string;
  subtitle: string;
};

const HeaderTitle = ({ title, subtitle }: HeaderTitleProps) => (
  <Container>
    <Typography
      variant="heading-3"
      color="primary"
      sx={{ marginBottom: 2 }}
      as="h2"
    >
      {title}
    </Typography>
    <Typography variant="body-2" color="secondary" as="h3">
      {subtitle}
    </Typography>
  </Container>
);

const Container = styled.header`
  text-align: center;
`;

export default HeaderTitle;
