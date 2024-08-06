import { useInView } from 'framer-motion';
import { useRef } from 'react';
import MobileDemoVideo from 'src/components/mobile-demo-video';
import styled from 'styled-components';

import IllustrationContainer from '../../illustration-container';

const OsProtected = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 'all' });
  return (
    <IllustrationContainer ref={ref}>
      <StyledMobileDemoVideo videoUrl="/auth/sections/passkeys.mp4" shouldPlay={isInView} hideReplay hideNotch />
    </IllustrationContainer>
  );
};

const StyledMobileDemoVideo = styled(MobileDemoVideo)`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) scale(0.52);
  border-radius: 56px;
  overflow: hidden;
`;

export default OsProtected;
