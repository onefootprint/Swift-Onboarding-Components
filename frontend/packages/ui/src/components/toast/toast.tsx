import { IcoCloseSmall16, IcoInfo16 } from '@onefootprint/icons';
import styled, { css, keyframes } from '@onefootprint/styled';
import React from 'react';

import LinkButton from '../link-button';
import Stack from '../stack';
import Typography from '../typography';
import type { ToastProps } from './toast.types';

const Toast = ({
  closeAriaLabel = 'Close',
  cta,
  description,
  leaving = false,
  onClose,
  testID,
  title,
  variant = 'default',
}: ToastProps) => (
  <ToastContainer
    role="alert"
    data-leaving={leaving}
    data-testid={testID}
    gap={3}
    align="start"
  >
    <Stack align="center" justify="center" marginTop={1}>
      <StyledIcoInfo16 color={variant === 'error' ? 'error' : undefined} />
    </Stack>
    <Stack
      flexGrow={1}
      align="start"
      justify="flex-start"
      height="fit-content"
      direction="column"
      gap={4}
    >
      <Stack direction="column">
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
      </Stack>
      {cta && (
        <LinkButton
          onClick={() => {
            onClose?.();
            cta.onClick?.();
          }}
          size="compact"
        >
          {cta.label}
        </LinkButton>
      )}
    </Stack>
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
    transform: translateX(380px);
  }
`;

const ToastContainer = styled(Stack)`
  ${({ theme }) => css`
    transform: translateX(380px);
    width: 380px;
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    box-shadow: ${theme.elevation[2]};
    padding: ${theme.spacing[4]};

    &[data-leaving='true'] {
      animation: ${slideOut} 200ms forwards;
    }

    &[data-leaving='false'] {
      animation: ${slideIn} 200ms forwards;
    }

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
    top: ${theme.spacing[1]};
  `}
`;

export default Toast;
