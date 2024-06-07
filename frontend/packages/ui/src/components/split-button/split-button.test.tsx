import '@testing-library/jest-dom/extend-expect';

import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import type { Option } from './components/dropdown-options';
import type { SplitButtonProps } from './split-button';
import SplitButton from './split-button';

const options: Option[] = [
  {
    label: 'Option 1',
    value: 'option1',
    onSelect: jest.fn(),
  },
  {
    label: 'Option 2',
    value: 'option2',
    onSelect: jest.fn(),
  },
];

describe('SplitButton', () => {
  const renderSplitButton = ({ disabled, loading, type, variant, size }: Partial<SplitButtonProps>) =>
    customRender(
      <SplitButton disabled={disabled} loading={loading} type={type} variant={variant} options={options} size={size} />,
    );

  it('should show the first option as the main button label', () => {
    renderSplitButton({});
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });
});
