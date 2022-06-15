import React from 'react';
import HeaderTitle from 'src/components/header-title';
import styled from 'styled-components';

const Success = () => (
  <Container>
    <HeaderTitle
      title="Successfully authenticated!"
      subtitle="Please continue on your computer."
    />
  </Container>
);

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default Success;
