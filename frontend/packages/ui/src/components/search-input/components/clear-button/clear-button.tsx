import { IcoCloseSmall16 } from '@onefootprint/icons';
import React from 'react';
import styled, { css } from 'styled-components';

type ClearButtonProps = {
  'aria-label': string;
  onClick: () => void;
};

const ClearButton = ({ 'aria-label': ariaLabel, onClick }: ClearButtonProps) => (
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
    right: ${theme.spacing[3]};
    top: 50%;
    transform: translateY(-50%);
    padding: ${theme.spacing[3]};
    background-color: ${theme.backgroundColor.primary};
    outline: none;
    padding: 0;
    transition: 0.2s opacity;
    position: absolute;

    @media (hover: hover) {
      :hover {
        opacity: 0.7;
      }
    }
  `};
`;

export default ClearButton;
