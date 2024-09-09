import type { Icon } from '@onefootprint/icons';
import * as React from 'react';
import styled, { css } from 'styled-components/native';

import Pressable from '../../../pressable';
import Typography from '../../../typography';

export type OptionFields = {
  value: string;
  label: string;
  IconComponent?: Icon;
};

export type OptionProps = OptionFields & {
  selected?: boolean;
  onPress?: () => void;
};

const Option = ({ value, label, selected = false, IconComponent, onPress }: OptionProps) => {
  const handlePress = () => {
    onPress?.();
  };

  return (
    <Pressable onPress={handlePress}>
      <OptionContainer role="button" value={value} key={value} selected={selected}>
        {IconComponent && (
          <IconContainer>
            <IconComponent color={selected ? 'quinary' : 'tertiary'} />
          </IconContainer>
        )}
        <Typography variant="label-3" color={selected ? 'quinary' : 'tertiary'}>
          {label}
        </Typography>
      </OptionContainer>
    </Pressable>
  );
};

const IconContainer = styled.View<{ selected?: boolean }>`
  ${({ theme, selected }) => css`
    color: ${theme.backgroundColor.secondary};
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: ${theme.spacing[2]};

    ${
      selected &&
      css`
      border: 0;
      color: ${theme.backgroundColor.primary};
    `
    }
  `}
`;

const OptionContainer = styled.View<{ selected: boolean; value: string }>`
  ${({ theme, selected }) => css`
    flex-direction: row;
    border: none;
    background-color: ${selected ? theme.backgroundColor.tertiary : 'transparent'};
    border-radius: ${theme.borderRadius.full};
    height: 40px;
    padding-horizontal: ${theme.spacing[5]};
    display: flex;
    justify-content: center;
    align-items: center;
  `}
`;

export default Option;
