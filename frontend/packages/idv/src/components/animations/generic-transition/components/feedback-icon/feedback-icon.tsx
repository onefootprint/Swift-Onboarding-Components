import type { Theme } from '@onefootprint/design-tokens';
import { IcoCheck16, IcoSpinner16, IcoWarning16 } from '@onefootprint/icons';
import styled, { css, keyframes } from '@onefootprint/styled';
import React from 'react';

type FeedbackIconProps = {
  variant: 'success' | 'error' | 'loading';
};
const FeedbackIcon = ({ variant }: FeedbackIconProps) => (
  <Container variant={variant}>
    {variant === 'success' && <IcoCheck16 color="success" />}
    {variant === 'error' && <IcoWarning16 color="error" />}
    {variant === 'loading' && <IcoSpinner16 color="warning" />}
  </Container>
);

const getBackgroundColor = (
  variant: FeedbackIconProps['variant'],
  theme: Theme,
) => {
  switch (variant) {
    case 'success':
      return theme.backgroundColor.success;
    case 'error':
      return theme.backgroundColor.error;
    case 'loading':
      return theme.backgroundColor.warning;
    default:
      return theme.backgroundColor.tertiary;
  }
};

const Container = styled.div<{ variant: FeedbackIconProps['variant'] }>`
  ${({ variant, theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: ${theme.borderRadius.full};
    background-color: ${getBackgroundColor(variant, theme)};
    animation: ${variant === 'loading' && spinnerAnimation} 1s infinite linear;
  `}
`;

const spinnerAnimation = keyframes`
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(359deg);
    }
`;

export default FeedbackIcon;
