import type { StepperOption } from '@onefootprint/ui';
import { StateValue } from 'xstate';

type GetStepProps = {
  value: StateValue;
  options: StepperOption[];
};

const parseStateValue = (value: StateValue): { topLevel: string; nested?: string } => {
  if (typeof value === 'string') {
    return { topLevel: value };
  }
  if (typeof value === 'object' && value !== null) {
    const keys = Object.keys(value);
    if (keys.length > 0) {
      const topLevel = keys[0];
      const nested = value[topLevel];
      if (typeof nested === 'string') {
        return { topLevel, nested };
      }
      throw new Error('Invalid nested state value');
    }
  }
  throw new Error('Invalid state value');
};

const getCurrentOption = ({ value, options }: GetStepProps) => {
  let currentOption: StepperOption = options[0];
  let currentSubOption: StepperOption | undefined;

  const { topLevel, nested } = parseStateValue(value);

  options.forEach(option => {
    if (option.value === topLevel) {
      currentOption = option;
    }
    if (nested && option.options) {
      option.options.forEach(subOption => {
        if (subOption.value === nested) {
          currentOption = option;
          currentSubOption = subOption;
        }
      });
    }
  });

  return { currentOption, currentSubOption };
};

export default getCurrentOption;
