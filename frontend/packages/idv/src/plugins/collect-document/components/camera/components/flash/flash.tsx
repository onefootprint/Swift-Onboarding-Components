import styled, { css, keyframes } from 'styled-components';

const flashAnimation = keyframes`
  from {
    opacity: 0.75;
  }
  to {
    opacity: 0;
  }
`;

const Flash = styled.div<{ $flash: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  opacity: 0;

  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
  `}

  ${({ $flash }) =>
    $flash &&
    css`
      animation: ${flashAnimation} 300ms ease-out;
    `}
`;

export default Flash;
