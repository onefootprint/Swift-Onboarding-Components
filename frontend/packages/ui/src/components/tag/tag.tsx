import type React from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';

export type TagProps = {
  children: React.ReactNode;
};

const Tag = styled.span<TagProps>`
  ${({ theme }) => css`
    ${createFontStyles('caption-1')};
    align-items: center;
    border-radius: ${theme.borderRadius.full};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};
    color: ${theme.color.neutral};
    display: flex;
    height: 24px;
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    user-select: none;
    white-space: nowrap;
  `};
`;

export default Tag;
