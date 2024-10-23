import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import styled, { css } from 'styled-components';

type OverlayProps = {
  isVisible?: boolean;
  isConfirmation?: boolean;
};

const Overlay = forwardRef<HTMLDivElement, OverlayProps>(
  ({ isVisible = false, isConfirmation = false }: OverlayProps, ref) =>
    isVisible && <OverlayLayer ref={ref} $isConfirmation={isConfirmation} />,
);

const OverlayLayer = styled(motion.div)<{ $isConfirmation: boolean }>`
  ${({ theme, $isConfirmation }) => css`
    position: fixed;
    background-color: ${theme.screenOverlay};
    height: 100vh;
    width: 100vw;
    left: 0;
    top: 0;
    user-select: none;
    z-index: ${$isConfirmation ? theme.zIndex.confirmationOverlay : theme.zIndex.overlay};
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
  `}
`;

export default Overlay;
