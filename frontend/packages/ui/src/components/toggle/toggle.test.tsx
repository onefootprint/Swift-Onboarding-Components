import React from 'react';
import { customRender, screen, userEvent } from 'test-utils';
import themes from 'themes';

import Toggle, { ToggleProps } from './toggle';

describe('<Toggle />', () => {
  const renderToggle = ({
    checked,
    defaultChecked,
    disabled,
    id,
    name,
    onBlur,
    onChange = jest.fn(),
    onFocus,
    required,
  }: Partial<ToggleProps>) =>
    customRender(
      <Toggle
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        id={id}
        name={name}
        onBlur={onBlur}
        onChange={onChange}
        onFocus={onFocus}
        required={required}
      />,
    );

  describe('<Toggle />', () => {
    describe('when it is a controlled component', () => {
      it('should check the checkbox', () => {
        renderToggle({
          checked: true,
        });
        const input = screen.getByRole('checkbox', {
          hidden: true,
        }) as HTMLInputElement;
        expect(input.checked).toBeTruthy();
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
