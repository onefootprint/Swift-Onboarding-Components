import '../../config/initializers/i18next-test';

import themes from '@onefootprint/design-tokens';
import { customRender, screen, userEvent } from '@onefootprint/test-utils';

import type { TextAreaProps } from './text-area';
import TextArea from './text-area';

describe('<TextArea />', () => {
  const renderTextArea = ({
    disabled,
    hasError,
    hint,
    label = 'label-text',
    onChange = jest.fn(),
    onChangeText = jest.fn(),
    placeholder = 'placeholder-text',
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
        value={value}
      />,
    );

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

      const textarea = screen.getByPlaceholderText('placeholder');
      expect(textarea).toHaveStyle({
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: themes.light.borderColor.error,
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

      const textarea = screen.getByPlaceholderText('placeholder text');
      await userEvent.type(textarea, 'foo');

      expect(onChangeMockFn).toHaveBeenCalled();
    });

    it('should trigger onChangeText event', async () => {
      const onChangeTextMockFn = jest.fn();
      renderTextArea({
        onChangeText: onChangeTextMockFn,
        label: 'Textarea',
      });

      const textarea = screen.getByLabelText('Textarea');
      await userEvent.type(textarea, 'f');

      expect(onChangeTextMockFn).toHaveBeenCalledWith('f');
    });

    describe('when it is disabled', () => {
      it('should not trigger onChangeText event', async () => {
        const onChangeTextMockFn = jest.fn();
        renderTextArea({
          disabled: true,
          onChangeText: onChangeTextMockFn,
          label: 'Textarea',
        });

        const textarea = screen.getByLabelText('Textarea');
        await userEvent.type(textarea, 'foo');
        expect(onChangeTextMockFn).not.toHaveBeenCalled();
      });
    });
  });
});
