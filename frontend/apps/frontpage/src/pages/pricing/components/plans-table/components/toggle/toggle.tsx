import { primitives } from '@onefootprint/design-tokens';
import { Text } from '@onefootprint/ui';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { Period } from '../../plans-table-types';
import { Periods } from '../../plans-table-types';

const { Root: ToggleGroupRoot, Item: ToggleGroupItem } = ToggleGroupPrimitive;

type ToggleProps = {
  onValueChange: (value: Period) => void;
  value: Period;
};

const options = [
  { value: Periods.monthly, label: Periods.monthly },
  { value: Periods.yearly, label: Periods.yearly },
];

const Toggle = ({ onValueChange, value }: ToggleProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.pricing.units' });
  return (
    <Container
      onValueChange={onValueChange}
      type="single"
      defaultValue={Periods.yearly}
      orientation="horizontal"
    >
      {options.map(option => (
        <Option
          key={option.value}
          value={option.value}
          data-selected={value === option.value}
        >
          <Text variant="label-3" data-selected={value === option.value}>
            {t(option.label).charAt(0).toUpperCase() + t(option.label).slice(1)}
          </Text>
          {option.value === value ? <Indicator layoutId="indicator" /> : null}
        </Option>
      ))}
    </Container>
  );
};

const Container = styled(ToggleGroupRoot)`
  ${({ theme }) => css`
    all: unset;
    display: flex;
    align-items: center;
    flex-direction: row;
    border-radius: ${theme.borderRadius.full};
    overflow: hidden;
    isolation: isolate;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    padding: ${theme.spacing[1]};
  `}
`;

const Option = styled(ToggleGroupItem)`
  ${({ theme }) => css`
    all: unset;
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: ${theme.spacing[3]} ${theme.spacing[5]};
    border-radius: ${theme.borderRadius.full};
    cursor: pointer;

    &[data-selected='true'] {
      p {
        z-index: 1;
        color: ${theme.color.quinary};
      }

      &:hover {
        span {
          background-color: ${primitives.Gray825};
        }
      }
    }

    &[data-selected='false'] {
      p {
        color: ${theme.color.secondary};
      }

      &:hover {
        color: ${theme.color.primary};
      }
    }
  `}
`;

const Indicator = styled(motion.span)`
  ${({ theme }) => css`
    position: absolute;
    height: 100%;
    width: 100%;
    border-radius: inherit;
    background-color: ${theme.backgroundColor.tertiary};
    z-index: 0;
  `}
`;

export default Toggle;
