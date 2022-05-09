import React from 'react';
import { customRender, screen, userEvent } from 'test-utils';

import themes from '../../config/themes';
import TextInput, { TextInputProps } from './text-input';

describe('<TextInput />', () => {
  const renderTextInput = ({
    disabled,
    hasError,
    hintText,
    label = 'label-text',
    mask,
    onChange = jest.fn(),
    onChangeText = jest.fn(),
    placeholder = 'placeholder-text',
    testID = 'input-test-id',
    value = '',
  }: Partial<TextInputProps>) =>
    customRender(
      <TextInput
        disabled={disabled}
        hasError={hasError}
        hintText={hintText}
        label={label}
        mask={mask}
        onChange={onChange}
        onChangeText={onChangeText}
        placeholder={placeholder}
        testID={testID}
        value={value}
      />,
    );

  it('should add a test id attribute', () => {
    renderTextInput({ testID: 'input-test-id' });
    expect(screen.getByTestId('input-test-id')).toBeInTheDocument();
  });

  it('should render value', () => {
    renderTextInput({ value: '123' });
    expect(screen.getByDisplayValue('123')).toBeInTheDocument();
  });

  it('should render the label', () => {
    renderTextInput({ label: 'some label' });
    expect(screen.getByLabelText('some label')).toBeInTheDocument();
  });

  it('should render the placeholder', () => {
    renderTextInput({ placeholder: 'some placeholder' });
    expect(screen.getByPlaceholderText('some placeholder')).toBeInTheDocument();
  });

  it('should render the hint text', () => {
    renderTextInput({ hintText: 'hint' });
    expect(screen.getByText('hint')).toBeInTheDocument();
  });

  describe('when it has an error', () => {
    it('should add an error border to the input', () => {
      renderTextInput({
        hasError: true,
        placeholder: 'placeholder',
      });
      const input = screen.getByPlaceholderText('placeholder');
      expect(input).toHaveStyle({
        border: `1px solid ${themes.light.borderColors.error}`,
      });
    });

    it('should add an error border to the hint', () => {
      renderTextInput({
        hasError: true,
        hintText: 'Hint',
      });
      const hint = screen.getByText('Hint');
      expect(hint).toHaveStyle({
        color: themes.light.colors.error,
      });
    });
  });

  describe('when changing the value', () => {
    it('should trigger onChange event', async () => {
      const onChangeMockFn = jest.fn();
      renderTextInput({
        onChange: onChangeMockFn,
        placeholder: 'placeholder text',
      });
      const input = screen.getByPlaceholderText('placeholder text');
      await userEvent.type(input, 'foo');
      expect(onChangeMockFn).toHaveBeenCalled();
    });

    it('should trigger onChangeText event', async () => {
      const onChangeTextMockFn = jest.fn();
      renderTextInput({
        onChangeText: onChangeTextMockFn,
        testID: 'input-test-id',
      });
      const input = screen.getByTestId('input-test-id');
      await userEvent.type(input, 'f');
      expect(onChangeTextMockFn).toHaveBeenCalledWith('f');
    });

    describe('when it is disabled', () => {
      it('should not trigger onChangeText event', () => {
        const onChangeTextMockFn = jest.fn();
        renderTextInput({
          disabled: true,
          onChangeText: onChangeTextMockFn,
          testID: 'input-test-id',
        });
        const input = screen.getByTestId('input-test-id');
        userEvent.type(input, 'foo');
        expect(onChangeTextMockFn).not.toHaveBeenCalled();
      });
    });
  });
});
