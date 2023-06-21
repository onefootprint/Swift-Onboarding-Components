import { IcoSearchSmall16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import React from 'react';

const SearchIcon = () => (
  <SearchIconContainer>
    <IcoSearchSmall16 />
  </SearchIconContainer>
);

const SearchIconContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    height: 100%;
    margin-left: ${theme.spacing[4]};
  `};
`;

export default SearchIcon;
