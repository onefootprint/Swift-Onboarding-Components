import { IcoSearch16, IcoSearchSmall16 } from 'icons';
import React from 'react';
import styled, { css } from 'styled-components';

import { sizeToIconMargin } from '../../search-input.constants';
import type { Size } from '../../search-input.types';

type SearchIconProps = {
  size: Size;
};

const SearchIcon = ({ size }: SearchIconProps) => (
  <SearchIconContainer size={size}>
    {size === 'compact' ? <IcoSearchSmall16 /> : <IcoSearch16 />}
  </SearchIconContainer>
);

const SearchIconContainer = styled.div<{ size: Size }>`
  ${({ theme, size }) => css`
    align-items: center;
    display: flex;
    height: 100%;
    margin-left: ${theme.spacing[sizeToIconMargin[size]]}px;
  `};
`;

export default SearchIcon;
