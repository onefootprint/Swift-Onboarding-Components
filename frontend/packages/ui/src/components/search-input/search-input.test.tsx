import React from 'react';
import { customRender, screen, userEvent } from 'test-utils';

import SearchInput, { SearchInputProps } from './search-input';

describe('<SearchInput />', () => {
  const renderSearchInput = ({
    clearButtonAriaLabel = 'Clear',
    inputSize = 'default',
    onChangeText,
    onReset,
    placeholder = 'Search...',
    testID = 'search-input-test-id',
    value = '',
  }: Partial<SearchInputProps>) =>
    customRender(
      <SearchInput
        clearButtonAriaLabel={clearButtonAriaLabel}
        inputSize={inputSize}
        onChangeText={onChangeText}
        onReset={onReset}
        placeholder={placeholder}
        testID={testID}
        value={value}
      />,
    );

  it('should add a test id attribute', () => {
    renderSearchInput({ testID: 'search-input-test-id' });
    expect(screen.getByTestId('search-input-test-id')).toBeInTheDocument();
  });

  it('should render value', () => {
    renderSearchInput({ value: '123' });
    expect(screen.getByDisplayValue('123')).toBeInTheDocument();
  });

  it('should support different sizes', () => {
    renderSearchInput({ testID: 'input-test-id-large', inputSize: 'large' });
    expect(screen.getByTestId('input-test-id-large')).toHaveStyle({
      height: '48px',
    });
    renderSearchInput({
      testID: 'input-test-id-default',
      inputSize: 'default',
    });
    expect(screen.getByTestId('input-test-id-default')).toHaveStyle({
      height: '40px',
    });
    renderSearchInput({
      testID: 'input-test-id-compact',
      inputSize: 'compact',
    });
    expect(screen.getByTestId('input-test-id-compact')).toHaveStyle({
      height: '32px',
    });
  });

  it('should render a clear button when the input has some content', () => {
    renderSearchInput({
      clearButtonAriaLabel: 'Clear content',
      value: 'lorem',
    });
    const clearButton = screen.getByRole('button', { name: 'Clear content' });
    expect(clearButton).toBeInTheDocument();
  });

  describe('when clicking on the clear button', () => {
    it('should trigger onChangeText with an empty string as argument', async () => {
      const onChangeTextMockFn = jest.fn();
      renderSearchInput({
        clearButtonAriaLabel: 'Clear content',
        onChangeText: onChangeTextMockFn,
        value: 'lorem',
      });
      await userEvent.click(
        screen.getByRole('button', { name: 'Clear content' }),
      );
      expect(onChangeTextMockFn).toHaveBeenCalledWith('');
    });
    it('should trigger onReset', async () => {
      const onResetMockFn = jest.fn();
      renderSearchInput({
        clearButtonAriaLabel: 'Clear content',
        onReset: onResetMockFn,
        value: 'lorem',
      });
      await userEvent.click(
        screen.getByRole('button', { name: 'Clear content' }),
      );
      expect(onResetMockFn).toHaveBeenCalled();
    });
  });
});
