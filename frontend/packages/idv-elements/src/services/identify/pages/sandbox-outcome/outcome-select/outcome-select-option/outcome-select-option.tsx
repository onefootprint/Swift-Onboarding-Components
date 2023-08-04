import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React, { useRef } from 'react';
import { useHover } from 'usehooks-ts';

export type OutcomeOptionFields = {
  title: string;
  value: string;
};

export type OutcomeSelectOptionProps = OutcomeOptionFields & {
  onClick: () => void;
  selected: boolean;
};

const OutcomeSelectOption = ({
  value,
  title,
  selected,
  onClick,
}: OutcomeSelectOptionProps) => {
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
      <Typography variant="label-4" color="primary">
        {title}
      </Typography>
    </Option>
  );
};

const Option = styled.button<{ selected?: boolean; hovered?: boolean }>`
  ${({ theme, selected, hovered }) => {
    const {
      components: { radioSelect },
    } = theme;

    return css`
      background: none;
      border-color: ${radioSelect.borderColor};
      border-radius: ${radioSelect.borderRadius};
      border-style: solid;
      border-width: ${radioSelect.borderWidth};
      cursor: pointer;
      display: flex;
      justify-content: center;
      padding: ${theme.spacing[3]};
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

export default OutcomeSelectOption;
