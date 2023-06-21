import { Icon } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import React, { useRef } from 'react';
import { useHover } from 'usehooks-ts';

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
  const optionRef = useRef(null);
  const isHovered = useHover(optionRef);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onClick();
  };

  return (
    <Option
      aria-label={title}
      aria-selected={selected}
      key={value}
      onClick={handleClick}
      selected={selected}
      type="button"
      ref={optionRef}
      hovered={isHovered}
    >
      <IconContainer selected={selected} hovered={isHovered}>
        <IconComponent color={selected ? 'quinary' : undefined} />
      </IconContainer>
      <OptionLabel>
        <Typography variant="label-2" color={selected ? 'accent' : 'primary'}>
          {title}
        </Typography>
        <Typography variant="body-4" color="secondary">
          {description}
        </Typography>
      </OptionLabel>
    </Option>
  );
};

const Option = styled.button<{ selected?: boolean; hovered?: boolean }>`
  ${({ theme, selected, hovered }) => css`
    background: none;
    text-align: left;
    cursor: pointer;
    margin: 0;
    border: 1px solid ${theme.borderColor.tertiary};
    padding: ${theme.spacing[5]};
    display: flex;
    flex-direction: row;
    justify-content: left;
    align-items: flex-start;
    border-radius: ${theme.borderRadius.default};
    gap: ${theme.spacing[4]};
    transition: all 0.2s ease-out;

    ${selected &&
    css`
      z-index: 1;
      background-color: #4a24db14;
      border: ${theme.borderWidth[1]} solid ${theme.borderColor.secondary};
    `}

    ${hovered &&
    !selected &&
    css`
      background-color: ${theme.backgroundColor.secondary};
      border: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};
    `}
  `}
`;

const IconContainer = styled.div<{ selected?: boolean; hovered?: boolean }>`
  ${({ theme, selected, hovered }) => css`
    width: 40px;
    height: 40px;
    min-width: 40px;
    border-radius: ${theme.borderRadius.full};
    background-color: ${theme.backgroundColor.secondary};
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.2s ease-out;
    margin-top: ${theme.spacing[1]};

    ${selected &&
    css`
      border: 0;
      background-color: ${theme.backgroundColor.accent};
    `}

    ${hovered &&
    !selected &&
    css`
      background-color: ${theme.backgroundColor.senary};
    `}
  `}
`;

const OptionLabel = styled.div`
  ${({ theme }) => css`
    padding: 0 ${theme.spacing[1]};
  `}
`;

export default RadioSelectOption;
