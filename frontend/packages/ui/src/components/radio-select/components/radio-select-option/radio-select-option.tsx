import { Icon } from '@onefootprint/icons';
import React from 'react';
import styled, { css } from 'styled-components';

import Typography from '../../../typography';

export type RadioSelectOptionFields = {
  title: string;
  description: string;
  IconComponent: Icon;
  value: string;
};

export type RadioSelectOptionProps = RadioSelectOptionFields & {
  onClick: () => void;
  selected: boolean;
};

const RadioSelectOption = ({
  value,
  title,
  description,
  selected,
  onClick,
  IconComponent,
}: RadioSelectOptionProps) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onClick();
  };

  return (
    <Option
      key={value}
      selected={selected}
      onClick={handleClick}
      aria-selected={selected}
      aria-label={description}
    >
      <IconContainer selected={selected}>
        <IconComponent color={selected ? 'quinary' : undefined} />
      </IconContainer>
      <OptionLabel>
        <Typography variant="label-2" color="accent">
          {title}
        </Typography>
        <Typography variant="body-4" color="secondary">
          {description}
        </Typography>
      </OptionLabel>
    </Option>
  );
};

const IconContainer = styled.div<{ selected?: boolean }>`
  ${({ theme, selected }) => css`
    width: 40px;
    height: 40px;
    min-width: 40px;
    border-radius: 50%;
    border: 1px solid ${theme.borderColor.tertiary};
    background: ${theme.backgroundColor.primary};
    display: flex;
    justify-content: center;
    align-items: center;

    ${selected &&
    css`
      border: 0;
      background: ${theme.backgroundColor.accent};
    `}
  `}
`;

const OptionLabel = styled.div`
  ${({ theme }) => css`
    margin-left: ${theme.spacing[4]};
  `}
`;

const Option = styled.button<{ selected?: boolean }>`
  ${({ theme, selected }) => css`
    background: none;
    text-align: left;
    cursor: pointer;
    margin: 0;
    border: 1px solid ${theme.borderColor.tertiary};
    padding: ${theme.spacing[5]};
    display: flex;
    justify-content: left;
    align-items: center;

    &:first-child {
      border-radius: ${theme.borderRadius.default} ${theme.borderRadius.default}
        0 0;
    }

    &:last-child {
      border-radius: 0 0 ${theme.borderRadius.default}
        ${theme.borderRadius.default};
    }

    &:not(:first-child) {
      margin-top: -1px; // because of the borders
    }

    ${selected &&
    css`
      z-index: 1;
      background-color: #4a24db14;
      border: 1px solid ${theme.borderColor.secondary};
    `}
  `}
`;

export default RadioSelectOption;
