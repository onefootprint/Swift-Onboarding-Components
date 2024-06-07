import type { Icon } from '@onefootprint/icons';
import * as Tabs from '@radix-ui/react-tabs';
import * as React from 'react';
import styled, { css } from 'styled-components';

import Text from '../../../text';

export type SegmentedControlOptionFields = {
  value: string;
  label: string;
  IconComponent?: Icon;
};

export type SegmentedControlOptionProps = SegmentedControlOptionFields & {
  selected?: boolean;
};

const SegmentedControlOption = ({
  value: optionValue,
  label,
  selected,
  IconComponent,
}: SegmentedControlOptionProps) => (
  <OptionTrigger role="button" value={optionValue} key={optionValue} data-selected={selected}>
    {IconComponent && (
      <IconContainer>
        <IconComponent color={selected ? 'quinary' : 'tertiary'} />
      </IconContainer>
    )}
    <Text variant="label-4">{label}</Text>
  </OptionTrigger>
);

const IconContainer = styled.div<{ selected?: boolean }>`
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

const OptionTrigger = styled(Tabs.Trigger)`
  ${({ theme }) => css`
    border: none;
    background-color: transparent;
    border-radius: ${theme.borderRadius.full};
    padding: ${theme.spacing[2]} ${theme.spacing[4]};
    display: flex;
    justify-content: center;
    align-items: center;

    &[data-state='active'] {
      background-color: ${theme.backgroundColor.tertiary};

      & > * {
        font-weight: 700;
        color: ${theme.color.quinary};
      }
    }

    &[data-state='inactive'] {
      & > * {
        color: ${theme.color.tertiary};
      }
    }
  `}
`;

export default SegmentedControlOption;
