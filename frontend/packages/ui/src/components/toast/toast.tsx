import { IcoCloseSmall16, IcoInfo16 } from '@onefootprint/icons';
import type React from 'react';
import { isMobile } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import styled, { css, keyframes } from 'styled-components';

import LinkButton from '../link-button';
import Stack from '../stack';
import Text from '../text';
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

  const handleClose = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (onClose) onClose();
  };

  return (
    <ToastContainer
      role="alert"
      data-leaving={leaving}
      data-testid={testID}
      gap={3}
      align="start"
      width={isMobile ? MOBILE_WIDTH : DESKTOP_WIDTH}
    >
      <Stack align="center" justify="center">
        <StyledIcoInfo16 color={variant === 'error' ? 'error' : undefined} />
      </Stack>
      <Stack flexGrow={1} align="start" justify="flex-start" height="fit-content" direction="column" gap={4}>
        <Stack direction="column">
          <Text color={variant === 'error' ? 'error' : 'primary'} variant="label-3" marginBottom={2}>
            {title}
          </Text>
          <Text color="tertiary" variant="body-3">
            {description}
          </Text>
        </Stack>
        {cta && (
          <LinkButton
            onClick={() => {
              onClose?.();
              cta.onClick?.();
            }}
          >
            {cta.label}
          </LinkButton>
        )}
      </Stack>
      <button
        aria-label={closeAriaLabel ?? (t('components.toast.close-aria-label-default') as string)}
        onClick={handleClose}
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
