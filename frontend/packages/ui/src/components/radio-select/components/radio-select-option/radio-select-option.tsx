import type { Icon } from '@onefootprint/icons';
import styled from '@onefootprint/styled';
import React, { useRef } from 'react';
import { useHover } from 'usehooks-ts';

import Tooltip from '../../../tooltip';
import Content from '../content';

export type RadioSelectOptionFields = {
  title: string;
  description?: string;
  IconComponent: Icon;
  value: string;
  disabled?: boolean;
  disabledHint?: string;
};

export type GroupedRadioSelectOptionFields = {
  groupTitle: string;
  options: RadioSelectOptionFields[];
};

export type RadioSelectOptionProps = RadioSelectOptionFields & {
  onClick: () => void;
  selected: boolean;
  size?: 'compact' | 'default';
};

const RadioSelectOption = ({
  value,
  title,
  description,
  selected,
  disabled,
  disabledHint,
  size = 'default',
  onClick,
  IconComponent,
}: RadioSelectOptionProps) => {
  const optionRef = useRef(null);
  const isHovered = useHover(optionRef);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onClick();
  };

  return disabled && disabledHint ? (
    <Tooltip text={disabledHint} aria-disabled={disabled} alignment="start">
      <Content
        title={title}
        description={description}
        IconComponent={IconComponent}
        selected={selected}
        hovered={isHovered}
        disabled={disabled}
        size={size}
      />
    </Tooltip>
  ) : (
    <Option
      aria-label={title}
      aria-selected={selected}
      key={value}
      onClick={handleClick}
      type="button"
      ref={optionRef}
    >
      <Content
        title={title}
        description={description}
        IconComponent={IconComponent}
        selected={selected}
        hovered={isHovered}
        disabled={disabled}
        size={size}
      />
    </Option>
  );
};

const Option = styled.button`
  all: unset;
  cursor: pointer;
  transition: all 0.2s ease-out;
`;

export default RadioSelectOption;
