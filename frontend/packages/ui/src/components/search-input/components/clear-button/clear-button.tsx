import { IcoCloseSmall16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import React from 'react';

type ClearButtonProps = {
  'aria-label': string;
  onClick: () => void;
};

const ClearButton = ({
  'aria-label': ariaLabel,
  onClick,
}: ClearButtonProps) => (
  <ClearButtonContainer onClick={onClick} aria-label={ariaLabel}>
    <IcoCloseSmall16 />
  </ClearButtonContainer>
);

const ClearButtonContainer = styled.button`
  ${({ theme }) => css`
    align-items: center;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    height: 100%;
    margin-right: ${theme.spacing[4]};
    outline: none;
    padding: 0;
    transition: 0.2s opacity;

    @media (hover: hover) {
      :hover {
        opacity: 0.7;
      }
    }
  `};
`;

export default ClearButton;
