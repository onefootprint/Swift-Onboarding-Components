import '../../config/initializers/i18next-test';

import themes from '@onefootprint/design-tokens';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender } from '../../utils/test-utils';

import type { ToggleProps } from './toggle';
import Toggle from './toggle';

describe('<Toggle />', () => {
  const renderToggle = ({
    checked,
    defaultChecked,
    disabled,
    hint,
    id,
    label,
    name,
    onBlur,
    onChange = jest.fn(),
    onFocus,
    required,
    size,
  }: Partial<ToggleProps>) =>
    customRender(
      <Toggle
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        hint={hint}
        id={id}
        label={label}
        name={name}
        onBlur={onBlur}
        onChange={onChange}
        onFocus={onFocus}
        required={required}
        size={size}
      />,
    );

  describe('<Toggle />', () => {
    describe('when it is a controlled component', () => {
      it('should check the checkbox', () => {
        renderToggle({ checked: true });
        const input = screen.getByRole('checkbox', {
          hidden: true,
        }) as HTMLInputElement;
        expect(input.checked).toBeTruthy();
      });
    });

    describe('when it is compact size', () => {
      it('should have the right size', () => {
        renderToggle({
          size: 'compact',
        });
        const toggle = screen.getByRole('switch');
        expect(toggle).toHaveStyle({
          width: '30px',
          height: '20px',
        });
      });
    });

    describe('when it has a hint', () => {
      it('should have the hint', () => {
        renderToggle({
          hint: 'Toggle hint',
        });
        const hint = screen.getByText('Toggle hint');
        expect(hint).toBeInTheDocument();
      });
    });

    describe('when it is a uncontrolled component', () => {
      it('should should set the defaultChecked value', () => {
        renderToggle({
          checked: undefined,
          defaultChecked: true,
        });
        const input = screen.getByRole('checkbox', {
          hidden: true,
        }) as HTMLInputElement;
        expect(input.checked).toBeTruthy();
      });
    });

    describe('when focusing the toggle', () => {
      it('should trigger onFocus event', async () => {
        const onFocusMockFn = jest.fn();
        renderToggle({
          onFocus: onFocusMockFn,
        });
        const toggle = screen.getByRole('switch');
        toggle.focus();
        expect(onFocusMockFn).toHaveBeenCalled();
      });
    });

    describe('when blurring the toggle', () => {
      it('should trigger onBlur event', async () => {
        const onBlurMockFn = jest.fn();
        renderToggle({
          onBlur: onBlurMockFn,
        });
        const toggle = screen.getByRole('switch');
        toggle.focus();
        toggle.blur();
        expect(onBlurMockFn).toHaveBeenCalled();
      });
    });

    describe('when clicking on the toggle', () => {
      it('should trigger onChange event', async () => {
        const onChangeMockFn = jest.fn();
        renderToggle({
          onChange: onChangeMockFn,
        });
        const toggle = screen.getByRole('switch');
        await userEvent.click(toggle);
        expect(onChangeMockFn).toHaveBeenCalled();
      });

      describe('when it is disabled', () => {
        it('should not trigger onChange event', async () => {
          const onChangeMockFn = jest.fn();
          renderToggle({
            disabled: true,
            onChange: onChangeMockFn,
          });
          const toggle = screen.getByRole('switch');
          await userEvent.click(toggle);
          expect(onChangeMockFn).not.toHaveBeenCalled();
        });
      });
    });

    describe('styles', () => {
      describe('when it is not checked', () => {
        it('should apply the expected styled', () => {
          renderToggle({
            checked: false,
          });
          const toggle = screen.getByRole('switch');
          expect(toggle).toHaveStyle({
            backgroundColor: themes.light.backgroundColor.secondary,
            borderColor: themes.light.borderColor.primary,
          });
        });
      });

      describe('when it is checked', () => {
        it('should apply the expected styled', () => {
          renderToggle({
            checked: true,
          });
          const toggle = screen.getByRole('switch');
          expect(toggle).toHaveStyle({
            borderColor: 'transparent',
            backgroundColor: themes.light.backgroundColor.accent,
          });
        });
      });
    });
  });
});
