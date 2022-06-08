import React from 'react';
import HeaderTitle from 'src/components/header-title';
import styled from 'styled-components';

const BiometricUnavailable = () => (
  <Container>
    <HeaderTitle
      title="No biometric authentication available"
      subtitle="Unfortunately your device doesn't support biometric authentication. Please continue on your computer."
    />
  </Container>
);

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default BiometricUnavailable;
