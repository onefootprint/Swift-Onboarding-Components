import { primitives } from '@onefootprint/design-tokens';
import styled, { css } from 'styled-components';

const IllustrationContainer = styled.div<{ $isDark?: boolean }>`
  ${({ theme, $isDark }) => css`
    height: 380px;
    width: 100%;
    border-radius: ${theme.borderRadius.default};
    background-color: ${$isDark ? primitives.Gray1000 : theme.backgroundColor.secondary};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    position: relative;
    overflow: hidden;
    user-select: none;
    pointer-events: none;
  `}
`;

export default IllustrationContainer;
