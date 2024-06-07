import type { StepperOption } from '@onefootprint/ui';

type GetStepProps = {
  value: string;
  options: StepperOption[];
};

const getCurrentOption = ({ value, options }: GetStepProps) => {
  let currentOption: StepperOption = options[0];
  let currentSubOption: StepperOption | undefined;

  options.forEach(option => {
    if (option.value === value) {
      currentOption = option;
    }
    if (option.options) {
      option.options.forEach(subOption => {
        if (subOption.value === value) {
          currentOption = option;
          currentSubOption = subOption;
        }
      });
    }
  });

  const isLastStep = currentOption && options.indexOf(currentOption) === options.length - 1;

  return { currentOption, currentSubOption, isLastStep };
};

export default getCurrentOption;
