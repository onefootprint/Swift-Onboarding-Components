import { motion } from 'framer-motion';
import type React from 'react';
import styled from 'styled-components';

type FadeInConatinerProps = {
  children: React.ReactNode;
};

const FadeInContainer = ({ children }: FadeInConatinerProps) => (
  <Container initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { type: 'tween', duration: 0.7 } }}>
    {children}
  </Container>
);

const Container = styled(motion.div)`
  height: 100%;
`;

export default FadeInContainer;
