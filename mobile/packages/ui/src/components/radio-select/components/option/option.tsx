import styled, { css } from '@onefootprint/styled';
import React, { useState } from 'react';

import { Box } from '../../../box';
import { Pressable } from '../../../pressable';
import { Typography } from '../../../typography';
import type { RadioSelectOption } from '../../radio-select.types';

export type OptionProps = RadioSelectOption & {
  onPress: () => void;
  selected: boolean;
};

const Option = ({
  value,
  title,
  description,
  selected,
  onPress,
  IconComponent,
}: OptionProps) => {
  const [active, setActive] = useState(false);

  return (
    <OptionContainer
      active={active}
      aria-label={title}
      aria-selected={selected}
      key={value}
      onPress={onPress}
      onPressIn={() => setActive(true)}
      onPressOut={() => setActive(false)}
      selected={selected}
      withImpact
    >
      <IconContainer selected={selected} active={active}>
        <IconComponent color={selected ? 'quinary' : undefined} />
      </IconContainer>
      <Box>
        <Typography variant="label-2" color={selected ? 'accent' : 'primary'}>
          {title}
        </Typography>
        <Typography variant="body-4" color="secondary">
          {description}
        </Typography>
      </Box>
    </OptionContainer>
  );
};

const OptionContainer = styled(Pressable)<{
  selected?: boolean;
  active?: boolean;
}>`
  ${({ theme, selected, active }) => {
    return css`
      align-items: center;
      background-color: ${theme.backgroundColor.primary};
      border-radius: ${theme.borderRadius.default};
      border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
      flex-direction: row;
      gap: ${theme.spacing[4]};
      padding: ${theme.spacing[5]};

      ${selected &&
      css`
        z-index: 1;
        background-color: #4a24db14;
        border-color: ${theme.borderColor.secondary};
      `}

      ${active &&
      !selected &&
      css`
        background-color: ${theme.backgroundColor.secondary};
        border-color: ${theme.borderColor.primary};
      `}
    `;
  }}
`;

const IconContainer = styled.View<{ selected?: boolean; active?: boolean }>`
  ${({ theme, active, selected }) => css`
    align-items: center;
    background-color: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.full};
    height: 40px;
    justify-content: center;
    width: 40px;

    ${selected &&
    css`
      border: none;
      background-color: ${theme.backgroundColor.accent};
    `}

    ${active &&
    !selected &&
    css`
      background-color: ${theme.backgroundColor.senary};
    `}
  `}
`;

export default Option;
