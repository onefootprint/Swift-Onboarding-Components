import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';

export type CodeProps = {
  children: string;
  testID?: string;
};

const Code = styled.span.attrs<CodeProps>(({ testID }) => ({
  'data-testid': testID,
  as: 'p',
}))<CodeProps>`
  ${({ theme }) => css`
    ${createFontStyles('snippet-2')};
    background: ${theme.backgroundColor.secondary};
    // TODO: ADD TO THEME
    // https://linear.app/footprint/issue/FP-226/add-new-variant-for-radius-4px
    border-radius: 4px;
    border: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};
    color: ${theme.color.error};
    padding: ${theme.spacing[1]}px ${theme.spacing[2]}px;
  `}
`;

export default Code;
