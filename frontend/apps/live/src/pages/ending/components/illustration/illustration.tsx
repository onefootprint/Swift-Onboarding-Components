import { Box, FootprintButton } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import AnimationDialog from '../animation-dialog';

const Illustration = () => {
  const [showDialog, setShowDialog] = useState(false);
  const handleClose = () => setShowDialog(false);
  const handleClick = () => setShowDialog(true);

  return (
    <Container>
      <Box marginTop={5}>
        <FootprintButton onClick={handleClick} />
      </Box>
      <AnimatePresence>
        {showDialog && (
          <DialogContainer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AnimationDialog onClose={handleClose} />
          </DialogContainer>
        )}
      </AnimatePresence>
      <Lines src="/ending/lines.svg" alt="Decorative" height={698} width={924} />
    </Container>
  );
};

const Container = styled(motion.span)`
  user-select: none;
  position: relative;

  &::after {
    content: '';
    z-index: -1;
    position: absolute;
    transform: translate(-50%, -50%);
    top: 0;
    left: 50%;
    width: 1200px;
    height: 1600px;
    background: radial-gradient(60% 80% at 50% 38%, #def8ff 0%, transparent 50%),
      radial-gradient(50% 60% at 50% 70%, #fcf3ff 0%, transparent 60%),
      radial-gradient(50% 60% at 46% 60%, #e8eaff 0%, transparent 57%);
    background-blend-mode: multiply;
  }

  button {
    position: relative;
    z-index: 1;
  }
`;

const Lines = styled(Image)`
  position: absolute;
  transform: translate(-50%, -50%);
  top: 0%;
  left: 50%;
  z-index: 0;
  mask: radial-gradient(90% 90% at 50% 60%, #fff 0%, transparent 40%);
  mix-blend-mode: overlay;
`;

const DialogContainer = styled(motion.div)`
  ${({ theme }) => css`
    z-index: ${theme.zIndex.dialog};
    position: fixed;
    transform: translate(-50%, -50%);
    top: 50%;
    left: 50%;
    box-shadow: ${theme.elevation[3]};
    border-radius: ${theme.borderRadius.default};
    border: 1px solid rgba(255, 255, 255, 0.47);
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  `}
`;

export default Illustration;
