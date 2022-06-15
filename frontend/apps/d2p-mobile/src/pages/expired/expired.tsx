import React from 'react';
import HeaderTitle from 'src/components/header-title';
import styled from 'styled-components';

const Expired = () => (
  <Container>
    <HeaderTitle
      title="Liveness check expired"
      subtitle="For security reasons, this link has timed out. Please return to your desktop to use a new one."
    />
  </Container>
);

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default Expired;
