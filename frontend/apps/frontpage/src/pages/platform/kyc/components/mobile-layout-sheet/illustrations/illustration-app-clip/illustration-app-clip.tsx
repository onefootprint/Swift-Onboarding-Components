import { motion } from 'framer-motion';
import Image from 'next/image';
import styled, { css } from 'styled-components';

const IllustrationAppClip = () => (
  <Container>
    <PhoneContainer>
      <PhoneFrame src="/kyc/sticky-rail/app-clip.png" alt="" width={375 * 0.75} height={812 * 0.75} />
    </PhoneContainer>
  </Container>
);

const Container = styled(motion.div)`
  width: 100%;
  height: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PhoneContainer = styled.div`
  ${({ theme }) => css`
    width: 240px;
    height: 487.5px;
    z-index: 1;
    background-color: ${theme.backgroundColor.primary};
    isolation: isolate;
    position: relative;
    overflow: hidden;
  `}
`;

const PhoneFrame = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 2;
  position: absolute;
  overflow: hidden;
`;

export default IllustrationAppClip;
