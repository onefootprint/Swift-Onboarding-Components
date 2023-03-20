import { IcoShield40 } from '@onefootprint/icons';
import { media } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import React from 'react';
import styled, { css } from 'styled-components';

const Shield = () => (
  <Container>
    <BullsEye>
      <Wave
        initial={{ height: '200px', width: '200px' }}
        animate={{
          height: '900px',
          width: '900px',
          opacity: [0, 1, 0],
          transition: {
            duration: 4,
            ease: 'easeOut',
            repeat: Infinity,
            delayRepeat: 2,
          },
        }}
      />
      <Wave
        initial={{
          height: '200px',
          width: '200px',
        }}
        animate={{
          height: '400px',
          width: '400px',
          opacity: [0, 1, 0],
          transition: {
            duration: 4,
            ease: 'easeOut',
            repeat: Infinity,
          },
        }}
      />
      <IconCenter>
        <IcoShield40 />
      </IconCenter>
    </BullsEye>
  </Container>
);

const Container = styled.div`
  user-select: none;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;

  ${media.greaterThan('sm')`
    overflow: visible;
  `}

  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 120%;
    background: radial-gradient(80% 80% at 50% 38%, #def8ff 0%, transparent 50%),
      radial-gradient(60% 80% at 50% 58%, #f3cfff 0%, transparent 50%),
      radial-gradient(100% 80% at 100% 0%, #f3cfff 0%, transparent 60%),
      radial-gradient(100% 100% at 50% 50%, #f3cfff 0%, transparent 60%);

    ${media.greaterThan('sm')`
      width: 150%;
      height: 100%;
      background: radial-gradient(60% 80% at 50% 38%, #def8ff 0%, transparent 50%),
      radial-gradient(50% 100% at 50% 20%, #f3cfff 0%, transparent 60%),
      radial-gradient(50% 60% at 70% 60%, #e8eaff 0%, transparent 57%),
      radial-gradient(100% 80% at 100% 0%, #f3cfff 0%, transparent 60%),
      radial-gradient(70% 70% at 30% 88%, #daf7ff 0%, transparent 50%);
    `};
  }
`;

const BullsEye = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
`;

const Wave = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  border-radius: 100%;
  z-index: 0;
  background: radial-gradient(
    50% 50% at 50% 50%,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.8) 100%
  );
`;

const IconCenter = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: ${theme.spacing[4]};
    border-radius: ${theme.borderRadius.full};
    background-color: rgba(255, 255, 255, 0.9);
    z-index: 2;
  `}
`;

export default Shield;
