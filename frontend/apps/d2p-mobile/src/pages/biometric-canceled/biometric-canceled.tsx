import React from 'react';
import HeaderTitle from 'src/components/header-title';
import styled from 'styled-components';

const BiometricCanceled = () => (
  <Container>
    <HeaderTitle
      title="Liveness check canceled"
      subtitle="Please go back to your computer."
    />
  </Container>
);

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default BiometricCanceled;
