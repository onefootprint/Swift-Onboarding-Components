import React from 'react';
import styled from 'styled-components';

import Footer from './components/footer';
import Header from './components/header';

// TODO: implement using components
// https://linear.app/footprint/issue/FP-492/create-page-skeleton
const MyFootprintIdentity = () => (
  <Container>
    <Header />
    <Footer />
  </Container>
);

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default MyFootprintIdentity;
