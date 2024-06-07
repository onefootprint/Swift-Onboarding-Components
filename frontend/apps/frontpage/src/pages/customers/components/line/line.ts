import { Box } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

type LineProps = {
  variant: 'horizontal' | 'vertical';
  position: { top?: string; bottom?: string; left?: string; right?: string };
};

const Line = styled(Box)<LineProps>`
  ${({ theme, variant, position: { top, bottom, left, right } }) => css`
    position: absolute;
    ${
      variant === 'vertical'
        ? `
      top: 50%;
      left: ${left || undefined};
      right: ${right || undefined};
      width: 1px;
      height: 150%;
      transform: translateY(-50%);
      background: radial-gradient(
        100% 70% at 50% 50%,
        ${theme.borderColor.tertiary} 0%,
        transparent 100%
      );
    `
        : `
      top: ${top || undefined};
      bottom: ${bottom || undefined};
      left: 0;
      right: 0;
      width: 100%;
      height: 1px;
      background: radial-gradient(
        70% 100% at 50% 50%,
        ${theme.borderColor.tertiary} 0%,
        transparent 100%
      );
    `
    }
  `}
`;

export default Line;
