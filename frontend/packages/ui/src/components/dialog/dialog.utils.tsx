import { css, useTheme } from 'styled-components';

import type { DialogSize, DialogSizeWidthMap } from './dialog.types';

export const useDialogSize = (
  size: DialogSize,
  disableResponsiveness?: boolean,
  isConfirmation?: boolean,
) => {
  const theme = useTheme();
  const widthMap: DialogSizeWidthMap = {
    compact: isConfirmation ? '468px' : '500px',
    large: '800px',
    'full-screen': '100vw',
    default: '650px',
  };

  const resolvedWidth = widthMap[size] || widthMap.default;
  const resolvedMaxHeight =
    size === 'full-screen' ? 'none' : `calc(100vh - 2 * ${theme.spacing[9]})`;
  const resolvedHeight = size === 'full-screen' ? '100vh' : 'auto';

  const resolvedMaxWidth = disableResponsiveness
    ? 'none'
    : `calc(100vw - ${theme.spacing[9]})`;

  return css`
    width: ${disableResponsiveness ? '100vw' : resolvedWidth};
    max-width: ${disableResponsiveness || size === 'full-screen'
      ? 'none'
      : resolvedMaxWidth};
    max-height: ${disableResponsiveness ? 'none' : resolvedMaxHeight};
    height: ${disableResponsiveness ? '100vh' : resolvedHeight};
  `;
};

export const useDialogPosition = (
  size: DialogSize,
  isConfirmation?: boolean,
) => {
  const theme = useTheme();
  if (isConfirmation) {
    return css`
      transform: translate(-50%, -50%);
      top: 50%;
      left: 50%;
    `;
  }
  if (size === 'full-screen') {
    return css`
      transform: translateY(0);
      top: 0;
      left: 0;
    `;
  }
  return css`
    transform: translateX(-50%);
    top: ${theme.spacing[9]};
    left: 50%;
  `;
};

export const useDialogZIndex = (isConfirmation?: boolean) => {
  const theme = useTheme();
  return css`
    z-index: ${isConfirmation
      ? theme.zIndex.confirmationDialog
      : theme.zIndex.dialog};
  `;
};
