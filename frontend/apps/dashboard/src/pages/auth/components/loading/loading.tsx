import styled from '@onefootprint/styled';
import RiveComponent from '@rive-app/react-canvas';
import React from 'react';

const Loading = () => (
  <Container>
    <Canvas>
      <RiveComponent src="/animations/warming-up.riv" />
    </Canvas>
  </Container>
);

const Container = styled.div`
  display: flex;
  align-items: center;
  height: 100vh;
  justify-content: center;
`;

const Canvas = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 260px;
  height: 260px;
`;

export default Loading;
