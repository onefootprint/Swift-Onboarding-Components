import '../../config/initializers/i18next-test';

import { customRender, screen, userEvent } from '@onefootprint/test-utils';

import type { RadioProps } from './radio';
import Radio from './radio';

describe('<Radio />', () => {
  const renderRadio = ({
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
  }: Partial<RadioProps>) =>
    customRender(
      <Radio
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

  describe('<Radio />', () => {
    it('should assign a testID', () => {
      renderRadio({
        testID: 'radio-test-id',
      });
      expect(screen.getByTestId('radio-test-id')).toBeInTheDocument();
    });

    it('should render the label', () => {
      renderRadio({
        label: 'label',
      });
      expect(screen.getByLabelText('label')).toBeInTheDocument();
    });

    it('should check', () => {
      renderRadio({
        label: 'label',
        checked: true,
      });
      const input = screen.getByLabelText('label') as HTMLInputElement;
      expect(input.checked).toBeTruthy();
    });

    it('should render the hint text', () => {
      renderRadio({ hint: 'hint' });
      expect(screen.getByText('hint')).toBeInTheDocument();
    });

    describe('when it has an error', () => {
      it('should add an error border to the input', () => {
        renderRadio({ hasError: true, label: 'label' });
        const input = screen.getByLabelText('label') as HTMLInputElement;

        expect(input).toHaveStyle({
          borderColor: 'var(--fp-primitives-red-500)',
        });
      });

      it('should add a error color to the hint', () => {
        renderRadio({ hasError: true, hint: 'Hint' });
        const hint = screen.getByText('Hint');

        expect(hint.getAttribute('data-has-error')).toEqual('true');
      });
    });

    describe('when clicking on the radio', () => {
      it('should trigger onChange event', async () => {
        const onChangeMockFn = jest.fn();
        renderRadio({
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
          renderRadio({
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
