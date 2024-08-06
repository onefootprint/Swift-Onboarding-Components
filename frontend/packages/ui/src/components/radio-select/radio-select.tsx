import noop from 'lodash/noop';
import styled, { css } from 'styled-components';

import Label from '../label';
import Stack from '../stack';
import Text from '../text';
import type { GroupedRadioSelectOptionFields, RadioSelectOptionFields } from './components/radio-select-option';
import RadioSelectOption from './components/radio-select-option';

export type RadioSelectProps = {
  label?: string;
  onChange?: (value: string) => void;
  options: RadioSelectOptionFields[] | GroupedRadioSelectOptionFields[];
  size?: 'compact' | 'default';
  testID?: string;
  value?: string;
};

const RadioSelect = ({ label, onChange, options, size, testID, value }: RadioSelectProps) => (
  <Stack direction="column">
    {label && <Label>{label}</Label>}
    <OptionsContainer data-testid={testID} direction="column" gap={3}>
      {options.map(option => {
        if ('label' in option) {
          return (
            <GroupContainer key={option.label} direction="column" gap={4}>
              <Text variant={size === 'compact' ? 'label-3' : 'label-2'} color="secondary">
                {option.label}
              </Text>
              {option.options.map(subOption => (
                <RadioSelectOption
                  key={subOption.value}
                  value={subOption.value}
                  title={subOption.title}
                  description={subOption.description}
                  IconComponent={subOption.IconComponent}
                  disabled={subOption.disabled}
                  disabledHint={subOption.disabledHint}
                  onClick={subOption.disabled ? noop : () => onChange?.(subOption.value)}
                  selected={subOption.value === value}
                  size={size}
                />
              ))}
            </GroupContainer>
          );
        }
        return (
          <RadioSelectOption
            key={option.value}
            value={option.value}
            title={option.title}
            description={option.description}
            IconComponent={option.IconComponent}
            disabled={option.disabled}
            disabledHint={option.disabledHint}
            onClick={option.disabled ? noop : () => onChange?.(option.value)}
            selected={option.value === value}
            size={size}
          />
        );
      })}
    </OptionsContainer>
  </Stack>
);

const OptionsContainer = styled(Stack)`
  div[data-tooltip-trigger='true'] {
    width: 100%;
  }
`;

const GroupContainer = styled(Stack)`
  ${({ theme }) => css`
    &:not(:first-child) {
      margin-top: ${theme.spacing[5]};
    }
  `};
`;
export default RadioSelect;
