import React, { useState } from 'react';
import styled, { css } from 'styled-components/native';

import Box from '../../../box';
import Pressable from '../../../pressable';
import Typography from '../../../typography';
import type { RadioSelectOption, StringOrNumber } from '../../radio-select.types';

export type RadioSelectOptionProps<T extends StringOrNumber = string> = RadioSelectOption<T> & {
  onPress: () => void;
  selected: boolean;
};

const Option = <T extends StringOrNumber = string>({
  value,
  title,
  selected,
  onPress,
  IconComponent,
}: RadioSelectOptionProps<T>) => {
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
    >
      <IconContainer selected={selected} active={active}>
        <IconComponent color={selected ? 'quinary' : undefined} />
      </IconContainer>
      <Box justifyContent="center">
        <Typography variant="label-2" color={selected ? 'accent' : 'primary'}>
          {title}
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
    const { radioSelect } = theme.components;

    return css`
      align-items: center;
      background-color: ${radioSelect.bg};
      border-radius: ${radioSelect.borderRadius};
      border: ${radioSelect.borderWidth} solid ${radioSelect.borderColor};
      flex-direction: row;
      gap: ${theme.spacing[4]};
      padding: ${theme.spacing[4]};

      ${
        selected &&
        css`
        z-index: 1;
        background-color: ${radioSelect.selected.bg};
        border-color: ${radioSelect.selected.borderColor};
      `
      }

      ${
        active &&
        !selected &&
        css`
        background-color: ${radioSelect.hover.bg};
        border-color: ${radioSelect.hover.borderColor};
      `
      }
    `;
  }}
`;

const IconContainer = styled.View<{ selected?: boolean; active?: boolean }>`
  ${({ theme, active, selected }) => {
    const { radioSelect } = theme.components;

    return css`
      align-items: center;
      background-color: ${radioSelect.components.icon.bg};
      border-radius: ${theme.borderRadius.full};
      height: 40px;
      justify-content: center;
      width: 40px;

      ${
        selected &&
        css`
        border: none;
        background-color: ${radioSelect.components.icon.selected.bg};
      `
      }

      ${
        active &&
        !selected &&
        css`
        background-color: ${radioSelect.components.icon.hover.bg};
      `
      }
    `;
  }}
`;

export default Option;
