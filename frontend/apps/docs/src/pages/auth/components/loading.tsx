import { IcoFootprint40 } from '@onefootprint/icons';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const Loading = () => (
  <Container>
    <Canvas
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{
        duration: 4,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: 'loop',
      }}
    >
      <IcoFootprint40 color="primary" />
    </Canvas>
  </Container>
);

const Container = styled.div`
  display: flex;
  align-items: center;
  height: 100vh;
  justify-content: center;
`;

const Canvas = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 260px;
  height: 260px;
`;

export default Loading;
