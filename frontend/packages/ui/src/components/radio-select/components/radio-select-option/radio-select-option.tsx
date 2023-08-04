import { Icon } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import React, { useRef } from 'react';
import { useHover } from 'usehooks-ts';

import { createFontStyles } from '../../../../utils';
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
        <Title selected={selected}>{title}</Title>
        <Typography variant="body-4" color="secondary">
          {description}
        </Typography>
      </OptionLabel>
    </Option>
  );
};

const Option = styled.button<{ selected?: boolean; hovered?: boolean }>`
  ${({ theme, selected, hovered }) => {
    const {
      components: { radioSelect },
    } = theme;

    return css`
      align-items: flex-start;
      background: none;
      border-color: ${radioSelect.borderColor};
      border-radius: ${radioSelect.borderRadius};
      border-style: solid;
      border-width: ${radioSelect.borderWidth};
      cursor: pointer;
      display: flex;
      flex-direction: row;
      gap: ${theme.spacing[4]};
      justify-content: left;
      margin: 0;
      padding: ${theme.spacing[5]};
      text-align: left;
      transition: all 0.2s ease-out;

      ${selected &&
      css`
        z-index: 1;
        background-color: ${radioSelect.selected.bg};
        border-color: ${radioSelect.selected.borderColor};
      `}

      ${hovered &&
      !selected &&
      css`
        background-color: ${radioSelect.hover.default.bg};
        border-color: ${radioSelect.hover.default.borderColor};
      `}
    `;
  }}
`;

const Title = styled.h2<{ selected?: boolean }>`
  ${({ theme, selected }) => {
    const {
      components: { radioSelect },
    } = theme;

    return css`
      ${createFontStyles('label-2')}
      color: ${theme.color.primary};

      ${selected &&
      css`
        color: ${radioSelect.color};
      `};
    `;
  }}
`;

const IconContainer = styled.div<{ selected?: boolean; hovered?: boolean }>`
  ${({ theme, selected, hovered }) => {
    const {
      components: { radioSelect },
    } = theme;

    return css`
      width: 40px;
      height: 40px;
      min-width: 40px;
      border-radius: ${theme.borderRadius.full};
      background-color: ${radioSelect.components.icon.bg};
      display: flex;
      justify-content: center;
      align-items: center;
      transition: all 0.2s ease-out;
      margin-top: ${theme.spacing[1]};

      ${selected &&
      css`
        border: 0;
        background-color: ${radioSelect.components.icon.selected.bg};
      `}

      ${hovered &&
      !selected &&
      css`
        background-color: ${radioSelect.components.icon.hover.bg};
      `}
    `;
  }}
`;

const OptionLabel = styled.div`
  ${({ theme }) => css`
    padding: 0 ${theme.spacing[1]};
  `}
`;

export default RadioSelectOption;
