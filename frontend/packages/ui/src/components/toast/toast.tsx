import IcoCloseSmall16 from 'icons/ico/ico-close-small-16';
import IcoInfo16 from 'icons/ico/ico-info-16';
import React from 'react';
import styled, { css, keyframes } from 'styled-components';

import Box from '../box';
import Typography from '../typography';
import type { ToastProps } from './toast.types';

const Toast = ({
  closeAriaLabel = 'Close',
  description,
  leaving = false,
  onClose,
  testID,
  title,
  variant = 'default',
}: ToastProps) => (
  <ToastContainer role="alert" leaving={leaving} data-testid={testID}>
    <StyledIcoInfo16 color={variant === 'error' ? 'error' : undefined} />
    <Box sx={{ flexGrow: 1 }}>
      <Typography
        color={variant === 'error' ? 'error' : 'primary'}
        variant="label-4"
      >
        {title}
      </Typography>
      <Typography color="tertiary" variant="body-4">
        {description}
      </Typography>
    </Box>
    <button
      aria-label={closeAriaLabel}
      onClick={onClose}
      tabIndex={0}
      type="button"
    >
      <IcoCloseSmall16 />
    </button>
  </ToastContainer>
);

const openAnimation = keyframes`
  from {
    opacity: 0;
    transform: translateX(-12.5%);
  }
  to {
    transform: translateX(0);
  }
`;

const closeAnimation = keyframes`
 from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-12.5%);
  }
`;

const ToastContainer = styled.div<{ leaving: boolean }>`
  ${({ theme, leaving }) => css`
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
    animation: ${leaving ? closeAnimation : openAnimation} 300ms
      cubic-bezier(0.175, 0.885, 0.32, 1.175) both;

    button {
      background: none;
      border: none;
      cursor: pointer;
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
