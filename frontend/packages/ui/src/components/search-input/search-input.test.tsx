import '../../config/initializers/i18next-test';

import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import type { SearchInputProps } from './search-input';
import SearchInput from './search-input';

describe('<SearchInput />', () => {
  const renderSearchInput = ({
    clearButtonAriaLabel = 'Clear',
    onChangeText,
    onReset,
    placeholder = 'Search...',
    testID = 'search-input-test-id',
    value = '',
    size,
  }: Partial<SearchInputProps>) =>
    customRender(
      <SearchInput
        clearButtonAriaLabel={clearButtonAriaLabel}
        onChangeText={onChangeText}
        onReset={onReset}
        placeholder={placeholder}
        testID={testID}
        value={value}
        size={size}
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
      await userEvent.click(screen.getByRole('button', { name: 'Clear content' }));
      expect(onChangeTextMockFn).toHaveBeenCalledWith('');
    });

    it('should trigger onReset', async () => {
      const onResetMockFn = jest.fn();
      renderSearchInput({
        clearButtonAriaLabel: 'Clear content',
        onReset: onResetMockFn,
        value: 'lorem',
      });
      await userEvent.click(screen.getByRole('button', { name: 'Clear content' }));
      expect(onResetMockFn).toHaveBeenCalled();
    });
  });
});
