import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import themes from '@onefootprint/themes';
import React from 'react';

import TextArea, { TextAreaProps } from './text-area';

describe('<TextArea />', () => {
  const renderTextArea = ({
    disabled,
    hasError,
    hint,
    label = 'label-text',
    onChange = jest.fn(),
    onChangeText = jest.fn(),
    placeholder = 'placeholder-text',
    testID = 'textarea-id',
    value = '',
  }: Partial<TextAreaProps>) =>
    customRender(
      <TextArea
        disabled={disabled}
        hasError={hasError}
        hint={hint}
        label={label}
        onChange={onChange}
        onChangeText={onChangeText}
        placeholder={placeholder}
        testID={testID}
        value={value}
      />,
    );

  it('should add a test id attribute', () => {
    renderTextArea({ testID: 'textarea-id' });
    expect(screen.getByTestId('textarea-id')).toBeInTheDocument();
  });

  it('should render value', () => {
    renderTextArea({ value: '123' });
    expect(screen.getByDisplayValue('123')).toBeInTheDocument();
  });

  it('should render the label', () => {
    renderTextArea({ label: 'some label' });
    expect(screen.getByLabelText('some label')).toBeInTheDocument();
  });

  it('should render the placeholder', () => {
    renderTextArea({ placeholder: 'some placeholder' });
    expect(screen.getByPlaceholderText('some placeholder')).toBeInTheDocument();
  });

  it('should render the hint text', () => {
    renderTextArea({ hint: 'hint' });
    expect(screen.getByText('hint')).toBeInTheDocument();
  });

  describe('when it has an error', () => {
    it('should add an error border to the input', () => {
      renderTextArea({
        hasError: true,
        placeholder: 'placeholder',
      });
      const input = screen.getByPlaceholderText('placeholder');
      expect(input).toHaveStyle({
        border: `1px solid ${themes.light.borderColor.error}`,
      });
    });

    it('should add an error border to the hint', () => {
      renderTextArea({
        hasError: true,
        hint: 'Hint',
      });
      const hint = screen.getByText('Hint');
      expect(hint).toHaveStyle({
        color: themes.light.color.error,
      });
    });
  });

  describe('when changing the value', () => {
    it('should trigger onChange event', async () => {
      const onChangeMockFn = jest.fn();
      renderTextArea({
        onChange: onChangeMockFn,
        placeholder: 'placeholder text',
      });
      const input = screen.getByPlaceholderText('placeholder text');
      await userEvent.type(input, 'foo');
      expect(onChangeMockFn).toHaveBeenCalled();
    });

    it('should trigger onChangeText event', async () => {
      const onChangeTextMockFn = jest.fn();
      renderTextArea({
        onChangeText: onChangeTextMockFn,
        testID: 'textarea-id',
      });
      const input = screen.getByTestId('textarea-id');
      await userEvent.type(input, 'f');
      expect(onChangeTextMockFn).toHaveBeenCalledWith('f');
    });

    describe('when it is disabled', () => {
      it('should not trigger onChangeText event', () => {
        const onChangeTextMockFn = jest.fn();
        renderTextArea({
          disabled: true,
          onChangeText: onChangeTextMockFn,
          testID: 'textarea-id',
        });
        const input = screen.getByTestId('textarea-id');
        userEvent.type(input, 'foo');
        expect(onChangeTextMockFn).not.toHaveBeenCalled();
      });
    });
  });
});
