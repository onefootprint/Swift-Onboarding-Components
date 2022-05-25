import IcoFootprint24 from 'icons/ico/ico-footprint-24';
import React from 'react';
import Users from 'src/pages/users/index.page';
import styled from 'styled';
import { Container, Typography } from 'ui';

const Root = () => (
  // TODO use bigger footprint icon and make this not ugly
  <Container>
    <Header>
      <IcoFootprint24 />
      <Typography variant="heading-1">Footprint</Typography>
    </Header>
    <Users />
  </Container>
);

const Header = styled.div`
  display: flex;
`;

export default Root;
