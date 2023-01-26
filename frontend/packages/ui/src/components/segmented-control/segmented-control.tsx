import * as Tabs from '@radix-ui/react-tabs';
import * as React from 'react';
import styled, { css } from 'styled-components';

import Typography from '../typography';

export type SegmentedControlProps = {
  'aria-label': string;
  options: string[];
  value: string;
  onChange: (newValue: string) => void;
};

const SegmentedControl = ({
  'aria-label': ariaLabel,
  value,
  options,
  onChange,
}: SegmentedControlProps) => (
  <Tabs.Root defaultValue={value} onValueChange={onChange}>
    <OptionsContainer aria-label={ariaLabel}>
      {options.map(option => (
        <OptionTrigger role="button" value={option} key={option}>
          <Typography variant="label-4">{option}</Typography>
        </OptionTrigger>
      ))}
    </OptionsContainer>
  </Tabs.Root>
);

const OptionsContainer = styled(Tabs.List)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    border-radius: ${theme.borderRadius.full};
    overflow: hidden;
    width: fit-content;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    padding: ${theme.spacing[2]};
    background-color: ${theme.backgroundColor.primary};
  `};
`;

const OptionTrigger = styled(Tabs.Trigger)`
  ${({ theme }) => css`
    border: none;
    background-color: transparent;
    border-radius: ${theme.borderRadius.full};
    padding: ${theme.spacing[2]} ${theme.spacing[4]};
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

export default SegmentedControl;
