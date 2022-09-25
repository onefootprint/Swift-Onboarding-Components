import styled, { css, keyframes } from 'styled-components';

const Flash = styled.div<{ isFlashing: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  opacity: 0;

  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
  `}
  ${({ isFlashing }) =>
    isFlashing
      ? css`
          animation: ${flashAnimation} 750ms ease-out;
        `
      : null}
`;

const flashAnimation = keyframes`
  from {
    opacity: 0.75;
  }

  to {
    opacity: 0;
  }
`;

export default Flash;
