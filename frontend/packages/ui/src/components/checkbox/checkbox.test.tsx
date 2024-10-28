import '../../config/initializers/i18next-test';

import themes from '@onefootprint/design-tokens';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender } from '../../utils/test-utils';

import type { CheckboxProps } from './checkbox';
import Checkbox from './checkbox';

describe('<Checkbox />', () => {
  const renderCheckbox = ({
    checked,
    disabled,
    hasError,
    hint,
    id,
    label = 'label',
    name,
    onChange = jest.fn(),
    required,
    testID,
  }: Partial<CheckboxProps>) =>
    customRender(
      <Checkbox
        checked={checked}
        disabled={disabled}
        hasError={hasError}
        hint={hint}
        id={id}
        label={label}
        name={name}
        onChange={onChange}
        required={required}
        testID={testID}
      />,
    );

  describe('<Checkbox />', () => {
    it('should assign a testID', () => {
      renderCheckbox({
        testID: 'checkbox-test-id',
      });
      expect(screen.getByTestId('checkbox-test-id')).toBeInTheDocument();
    });

    it('should render the label', () => {
      renderCheckbox({
        label: 'label',
      });
      expect(screen.getByLabelText('label')).toBeInTheDocument();
    });

    it('should check', () => {
      renderCheckbox({
        label: 'label',
        checked: true,
      });
      const input = screen.getByLabelText('label') as HTMLInputElement;
      expect(input.checked).toBeTruthy();
    });

    it('should render the hint text', () => {
      renderCheckbox({ hint: 'hint' });
      expect(screen.getByText('hint')).toBeInTheDocument();
    });

    describe('when it has an error', () => {
      it('should add an error border to the input', () => {
        renderCheckbox({
          hasError: true,
          label: 'label',
        });
        const input = screen.getByLabelText('label') as HTMLInputElement;
        expect(input).toHaveStyle({
          borderColor: themes.light.borderColor.error,
        });
      });

      it('should add an error border to the hint', () => {
        renderCheckbox({
          hasError: true,
          hint: 'Hint',
        });
        const hint = screen.getByText('Hint');
        expect(hint).toHaveStyle({
          color: themes.light.color.error,
        });
      });
    });

    describe('when clicking on the checkbox', () => {
      it('should trigger onChange event', async () => {
        const onChangeMockFn = jest.fn();
        renderCheckbox({
          onChange: onChangeMockFn,
          label: 'label',
        });
        const input = screen.getByLabelText('label') as HTMLInputElement;
        await userEvent.click(input);
        expect(onChangeMockFn).toHaveBeenCalled();
      });

      describe('when it is disabled', () => {
        it('should not trigger onChangeText event', async () => {
          const onChangeMockFn = jest.fn();
          renderCheckbox({
            disabled: true,
            label: 'label',
            onChange: onChangeMockFn,
          });
          const input = screen.getByLabelText('label') as HTMLInputElement;
          await userEvent.click(input);
          expect(onChangeMockFn).not.toHaveBeenCalled();
        });
      });
    });
  });
});
