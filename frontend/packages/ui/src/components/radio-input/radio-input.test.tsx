import React from 'react';
import { customRender, screen, userEvent } from 'test-utils';
import themes from 'themes';

import RadioInput, { RadioInputProps } from './radio-input';

describe('<RadioInput />', () => {
  const renderInputRadio = ({
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
  }: Partial<RadioInputProps>) =>
    customRender(
      <RadioInput
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

  describe('<RadioInput />', () => {
    it('should assign a testID', () => {
      renderInputRadio({
        testID: 'RadioInput-test-id',
      });
      expect(screen.getByTestId('RadioInput-test-id')).toBeInTheDocument();
    });

    it('should render the label', () => {
      renderInputRadio({
        label: 'label',
      });
      expect(screen.getByLabelText('label')).toBeInTheDocument();
    });

    it('should check', () => {
      renderInputRadio({
        label: 'label',
        checked: true,
      });
      const input = screen.getByLabelText('label') as HTMLInputElement;
      expect(input.checked).toBeTruthy();
    });

    it('should render the hint text', () => {
      renderInputRadio({ hint: 'hint' });
      expect(screen.getByText('hint')).toBeInTheDocument();
    });

    describe('when it has an error', () => {
      it('should add an error border to the input', () => {
        renderInputRadio({
          hasError: true,
          label: 'label',
        });
        const input = screen.getByLabelText('label') as HTMLInputElement;
        expect(input).toHaveStyle({
          borderColor: themes.light.borderColor.error,
        });
      });

      it('should add an error border to the hint', () => {
        renderInputRadio({
          hasError: true,
          hint: 'Hint',
        });
        const hint = screen.getByText('Hint');
        expect(hint).toHaveStyle({
          color: themes.light.color.error,
        });
      });
    });

    describe('when clicking on the RadioInput', () => {
      it('should trigger onChange event', async () => {
        const onChangeMockFn = jest.fn();
        renderInputRadio({
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
          renderInputRadio({
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
