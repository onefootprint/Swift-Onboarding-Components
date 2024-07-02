import { primitives } from '@onefootprint/design-tokens';
import { createFontStyles } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

const Tag = styled.p`
  ${({ theme }) => css`
    ${createFontStyles('snippet-2')}
    font-family: ${theme.fontFamily.code};
    color: ${primitives.Gray0};
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${primitives.Gray600};
    white-space: nowrap;
    overflow: hidden;
    background-color: ${primitives.Gray800};
  `};
`;

export default Tag;
