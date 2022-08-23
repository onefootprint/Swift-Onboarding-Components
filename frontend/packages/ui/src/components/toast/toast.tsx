import { IcoCloseSmall16, IcoInfo16 } from 'icons';
import React from 'react';
import styled, { css, keyframes } from 'styled-components';

import Box from '../box';
import Typography from '../typography';
import type { ToastProps } from './toast.types';

const Toast = ({
  closeAriaLabel = 'Close',
  description,
  leaving = false,
  onHide,
  testID,
  title,
  variant = 'default',
}: ToastProps) => (
  <ToastContainer role="alert" leaving={leaving} data-testid={testID}>
    <Box>
      <StyledIcoInfo16 color={variant === 'error' ? 'error' : undefined} />
    </Box>
    <Box sx={{ flexGrow: 1 }}>
      <Typography
        color={variant === 'error' ? 'error' : 'primary'}
        variant="label-3"
        sx={{ marginBottom: 2 }}
      >
        {title}
      </Typography>
      <Typography color="tertiary" variant="body-3">
        {description}
      </Typography>
    </Box>
    <button
      aria-label={closeAriaLabel}
      onClick={onHide}
      tabIndex={0}
      type="button"
    >
      <IcoCloseSmall16 />
    </button>
  </ToastContainer>
);

const slideIn = keyframes`
  to {
    transform: translateX(0);
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(320px);
  }
`;

const ToastContainer = styled.div<{ leaving: boolean }>`
  ${({ theme, leaving }) => css`
    transform: translateX(320px);
    width: 320px;
    align-items: flex-start;
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius[2]}px;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    box-shadow: ${theme.elevation[2]};
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[3]}px;
    padding: ${theme.spacing[4]}px;
    animation: ${leaving ? slideOut : slideIn} 200ms forwards;

    button {
      background: none;
      border: none;
      cursor: pointer;
      margin: 0;
      padding: 0;
    }
  `}
`;

const StyledIcoInfo16 = styled(IcoInfo16)`
  ${({ theme }) => css`
    position: relative;
    top: ${theme.spacing[1]}px;
  `}
`;

export default Toast;
