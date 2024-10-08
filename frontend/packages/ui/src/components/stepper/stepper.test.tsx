import '../../config/initializers/i18next-test';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender } from '../../utils/test-utils';
import Stepper from './stepper';
import type { StepperOption, StepperProps } from './stepper.types';

const renderStepper = (props: Partial<StepperProps> = {}) => {
  const defaultOptions: StepperOption[] = [
    { label: 'Step 1', value: 'step1' },
    { label: 'Step 2', value: 'step2' },
    { label: 'Step 3', value: 'step3' },
  ];

  return customRender(
    <Stepper
      aria-label={props['aria-label'] || 'stepper'}
      options={props.options || defaultOptions}
      value={props.value || { option: defaultOptions[0] }}
      onChange={props.onChange}
    />,
  );
};

describe('<Stepper />', () => {
  it('should highlight the selected option', () => {
    renderStepper({
      value: { option: { label: 'Step 2', value: 'step2' } },
    });
    const selectedOption = screen.getByText('Step 2').closest('li');
    expect(selectedOption).toHaveAttribute('data-selected', 'true');
  });

  it('should display completed options', () => {
    renderStepper({
      value: { option: { label: 'Step 3', value: 'step3' } },
    });
    const completedOption = screen.getByText('Step 1').closest('li');
    expect(completedOption).toHaveAttribute('data-completed', 'true');
  });

  it('should display next options', () => {
    renderStepper({
      value: { option: { label: 'Step 2', value: 'step2' } },
    });
    const nextOption = screen.getByText('Step 3').closest('li');
    expect(nextOption).toHaveAttribute('data-next', 'true');
  });

  it('should trigger the onChange callback with correct value when an option is clicked', async () => {
    const onChangeMockFn = jest.fn();
    renderStepper({ onChange: onChangeMockFn });
    const step2Button = screen.getByText('Step 1');
    await userEvent.click(step2Button);
    expect(onChangeMockFn).toHaveBeenCalledWith({
      label: 'Step 1',
      value: 'step1',
    });
  });
});
