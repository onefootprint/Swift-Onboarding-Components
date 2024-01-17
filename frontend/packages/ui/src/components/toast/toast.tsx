import { IcoCloseSmall16, IcoInfo16 } from '@onefootprint/icons';
import styled, { css, keyframes } from '@onefootprint/styled';
import React from 'react';
import { isMobile } from 'react-device-detect';
import { useTranslation } from 'react-i18next';

import LinkButton from '../link-button';
import Stack from '../stack';
import Typography from '../typography';
import type { ToastProps } from './toast.types';

const DESKTOP_WIDTH = '380px';
const MOBILE_WIDTH = '90vw';

const Toast = ({
  closeAriaLabel,
  cta,
  description,
  leaving = false,
  onClose,
  testID,
  title,
  variant = 'default',
}: ToastProps) => {
  const { t } = useTranslation('ui');

  return (
    <ToastContainer
      role="alert"
      data-leaving={leaving}
      data-testid={testID}
      gap={3}
      align="start"
      width={isMobile ? MOBILE_WIDTH : DESKTOP_WIDTH}
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
        aria-label={
          closeAriaLabel ?? t('components.toast.close-aria-label-default')
        }
        onClick={onClose}
        tabIndex={0}
        type="button"
      >
        <IcoCloseSmall16 />
      </button>
    </ToastContainer>
  );
};

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
    transform: translateX(${isMobile ? MOBILE_WIDTH : DESKTOP_WIDTH});
  }
`;

const ToastContainer = styled(Stack)<{ width: string }>`
  ${({ theme, width }) => css`
    width: ${width};
    transform: translateX(${width});
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
