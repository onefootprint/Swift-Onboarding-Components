import React from 'react';
import { customRender, screen } from 'test-utils';

import SearchInput, { SearchInputProps } from './search-input';

describe('<SearchInput />', () => {
  const renderSearchInput = ({
    testID = 'input-test-id',
    inputSize = 'default',
    value = '',
  }: Partial<SearchInputProps>) =>
    customRender(
      <SearchInput testID={testID} inputSize={inputSize} value={value} />,
    );

  it('should add a test id attribute', () => {
    renderSearchInput({ testID: 'input-test-id' });
    expect(screen.getByTestId('input-test-id')).toBeInTheDocument();
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
});
