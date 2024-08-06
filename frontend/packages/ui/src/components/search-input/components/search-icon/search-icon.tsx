import { IcoSearchSmall16 } from '@onefootprint/icons';
import styled, { css } from 'styled-components';

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
