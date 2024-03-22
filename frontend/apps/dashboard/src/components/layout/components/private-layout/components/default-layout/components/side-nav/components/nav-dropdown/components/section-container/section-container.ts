import type { Spacing } from '@onefootprint/design-tokens';
import styled, { css } from 'styled-components';

const SectionContainer = styled.div<{ top?: Spacing; bottom?: Spacing }>`
  ${({ theme, top, bottom }) => css`
    position: relative;
    padding-top: ${theme.spacing[top || 4]};
    padding-bottom: ${theme.spacing[bottom || 4]};
    display: flex;
    flex-direction: column;

    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      width: 150%;
      height: 1px;
      transform: translateX(-50%);
      background-color: ${theme.borderColor.tertiary};
    }
  `};
`;

export default SectionContainer;
