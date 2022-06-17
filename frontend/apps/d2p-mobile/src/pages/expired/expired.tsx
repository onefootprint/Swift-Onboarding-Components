import React from 'react';
import HeaderTitle from 'src/components/header-title';
import useAuthToken from 'src/hooks/use-auth-token';
import styled from 'styled-components';

const Expired = () => {
  useAuthToken();

  return (
    <Container>
      <HeaderTitle
        title="Liveness check expired"
        subtitle="For security reasons, this link has timed out. Please return to your desktop to use a new one."
      />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default Expired;
