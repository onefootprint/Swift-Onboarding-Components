import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css, keyframes } from 'styled-components';

import type { SXStyleProps, SXStyles } from '../../hooks/use-sx';
import useSX from '../../hooks/use-sx';

export type ShimmerProps = {
  'aria-hidden'?: boolean;
  'aria-valuetext'?: string;
  sx?: SXStyleProps;
  testID?: string;
};

const Shimmer = ({
  'aria-hidden': ariaHidden,
  testID,
  sx,
  'aria-valuetext': ariaValueText = 'Loading...',
}: ShimmerProps) => {
  const sxStyles = useSX(sx);
  const { t } = useTranslation('ui');

  return (
    <ShimmerContainer
      aria-hidden={ariaHidden}
      aria-busy="true"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuetext={
        ariaValueText ?? t('components.shimmer.aria-valuetext-default')
      }
      data-testid={testID}
      role="progressbar"
      $sx={sxStyles}
      tabIndex={0}
    />
  );
};

const blink = keyframes`
  100% {
    transform: translateX(100%);
  }
`;

const ShimmerContainer = styled.div<{ $sx: SXStyles }>`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.sm};
    overflow: hidden;
    position: relative;

    &::after {
      bottom: 0;
      content: '';
      left: 0;
      position: absolute;
      right: 0;
      top: 0;
      transform: translateX(-100%);

      background-image: linear-gradient(
        90deg,
        rgba(${theme.backgroundColor.primary}, 0) 0,
        rgba(${theme.backgroundColor.primary}, 0.2) 20%,
        rgba(${theme.backgroundColor.primary}, 0.5) 60%,
        rgba(${theme.backgroundColor.primary}, 0)
      );
      animation: ${blink} 2s infinite;
    }
  `}
  ${({ $sx }) => css`
    ${$sx};
  `}
`;

export default Shimmer;
