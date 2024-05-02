'use client';

import type { Icon } from '@onefootprint/icons';
import React from 'react';

import Tooltip from '../../../tooltip';
import Content from './components/content';

export type RadioSelectOptionFields = {
  title: string | JSX.Element;
  description?: string;
  IconComponent: Icon;
  value: string;
  disabled?: boolean;
  disabledHint?: string;
};

export type GroupedRadioSelectOptionFields = {
  label: string;
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
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onClick();
  };

  return disabled && disabledHint ? (
    <Tooltip text={disabledHint} aria-disabled={disabled} alignment="start">
      <Content
        description={description}
        disabled={disabled}
        IconComponent={IconComponent}
        selected={selected}
        size={size}
        title={title}
      />
    </Tooltip>
  ) : (
    <Content
      description={description}
      disabled={disabled}
      IconComponent={IconComponent}
      key={value}
      onClick={handleClick}
      selected={selected}
      size={size}
      title={title}
    />
  );
};

export default RadioSelectOption;
