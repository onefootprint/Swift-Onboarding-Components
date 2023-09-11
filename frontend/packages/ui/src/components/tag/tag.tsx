import styled, { css } from '@onefootprint/styled';
import type React from 'react';

import { createFontStyles } from '../../utils/mixins';

export type TagProps = {
  children: React.ReactNode;
};

const Tag = styled.span<TagProps>`
  ${({ theme }) => css`
    ${createFontStyles('body-4')};
    color: ${theme.color.neutral};
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};
    border-radius: ${theme.borderRadius.full};
    white-space: nowrap;
    user-select: none;
  `};
`;

export default Tag;
