import React from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';

export type TagProps = {
  children: React.ReactNode;
};

const Tag = styled.span<TagProps>`
  ${({ theme }) => css`
    ${createFontStyles('label-4')};
    background-color: ${theme.backgroundColor.neutral};
    border-radius: ${theme.borderRadius.compact};
    color: ${theme.color.neutral};
    padding: ${theme.spacing[1]} ${theme.spacing[2]};
  `};
`;

export default Tag;
