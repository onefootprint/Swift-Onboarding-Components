import styled, { css } from 'styled-components';

export type OverlayProps = {
  onClick?: () => void;
  testID?: string;
};

const Overlay = styled.div<OverlayProps>`
  ${({ theme }) => css`
    align-items: center;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    height: 100%;
    justify-content: center;
    left: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: ${theme.zIndex.overlay};
  `}
`;

export default Overlay;
