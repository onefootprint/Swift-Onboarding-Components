import IcoClose16 from 'icons/ico/ico-close-16';
import IcoCloseSmall16 from 'icons/ico/ico-close-small-16';
import React from 'react';
import styled, { css } from 'styled-components';

import { sizeToIconMargin } from '../../search-input.constants';
import type { Size } from '../../search-input.types';

type ClearButtonProps = {
  'aria-label': string;
  size: Size;
  onClick: () => void;
};

const ClearButton = ({
  'aria-label': ariaLabel,
  size,
  onClick,
}: ClearButtonProps) => (
  <ClearButtonContainer size={size} onClick={onClick} aria-label={ariaLabel}>
    {size === 'compact' ? <IcoCloseSmall16 /> : <IcoClose16 />}
  </ClearButtonContainer>
);

const ClearButtonContainer = styled.button<{ size: Size }>`
  ${({ theme, size }) => css`
    padding: 0;
    align-items: center;
    background: none;
    border: none;
    display: flex;
    height: 100%;
    margin-right: ${theme.spacing[sizeToIconMargin[size]]}px;
    outline: none;
    transition: 0.2s opacity;

    :hover {
      opacity: 0.7;
    }
  `};
`;

export default ClearButton;
