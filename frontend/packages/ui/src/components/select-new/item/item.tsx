import { IcoCheckSmall16, IcoInfo16 } from '@onefootprint/icons';
import * as Select from '@radix-ui/react-select';
import React from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../../utils';
import Tooltip from '../../tooltip';
import type { ItemProps } from '../select-new.types';

const Item = ({ option, size }: ItemProps) => (
  <StyledItem value={option.value} disabled={option.disabled} size={size}>
    <TextContainer>
      <Select.ItemText>{option.label}</Select.ItemText>
    </TextContainer>
    <IndicatorContainer>
      <IcoCheckSmall16 color="secondary" />
    </IndicatorContainer>
    {option.disabled && option.disabledTooltipText && (
      <Tooltip text={option.disabledTooltipText}>
        <IcoInfo16 color="quaternary" aria-label="tooltip-help" />
      </Tooltip>
    )}
  </StyledItem>
);

const StyledItem = styled(Select.Item)<{ size?: string; disabled?: boolean }>`
  ${({ theme, size, disabled }) => css`
    ${createFontStyles(size === 'compact' ? 'body-4' : 'body-3')};
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    border-radius: calc(${theme.borderRadius.default} - 2px);
    cursor: pointer;
    user-select: none;
    background-color: ${theme.backgroundColor.primary};
    color: ${theme.color.primary};
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &:hover {
      &:not([data-disabled]) {
        background-color: ${theme.backgroundColor.secondary};
        border: none;
      }
    }

    &:focus {
      outline: none;
    }

    ${
      disabled &&
      css`
      cursor: initial;
      color: ${theme.color.quaternary};
    `
    }
  `}
`;

const IndicatorContainer = styled(Select.ItemIndicator)`
  ${({ theme }) => css`
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: ${theme.spacing[3]};
  `}
`;

const TextContainer = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export default Item;
