import type { StepperOption } from '@onefootprint/ui';
import type { Step } from './reducer/reducer';

const detailsSteps: Step[] = ['residency', 'kycData', 'requiredAuthMethods'];

const getStepperValue = (options: StepperOption[], step: Step) => {
  const isDetailsStep = detailsSteps.includes(step);

  if (isDetailsStep) {
    const mainOption = options.find(option => option.value === 'details');
    const subOption = mainOption?.options?.find(option => option.value === step);
    if (!mainOption || !subOption) {
      throw new Error(`Invalid step: ${step}`);
    }
    return { option: mainOption, subOption };
  }
  const mainOption = options.find(option => option.value === step);
  if (!mainOption) {
    throw new Error(`Invalid step: ${step}`);
  }
  return { option: mainOption };
};

export default getStepperValue;
