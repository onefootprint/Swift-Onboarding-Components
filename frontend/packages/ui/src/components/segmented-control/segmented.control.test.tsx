import themes from '@onefootprint/design-tokens';
import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import SegmentedControl, { SegmentedControlProps } from './segmented-control';

describe('<SegmentedControl />', () => {
  const renderSegmentedControl = ({
    'aria-label': ariaLabel = 'Segmented Control',
    onChange = jest.fn(),
    options = ['Option 1', 'Option 2'],
    value = 'Option 1',
  }: Partial<SegmentedControlProps>) =>
    customRender(
      <SegmentedControl
        aria-label={ariaLabel}
        onChange={onChange}
        options={options}
        value={value}
      />,
    );

  it('should render the options', () => {
    renderSegmentedControl({});
    expect(
      screen.getByRole('button', { name: 'Option 1' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Option 2' }),
    ).toBeInTheDocument();
  });

  describe('when an option is selected', () => {
    it('should have a different style in order to highlight it', () => {
      renderSegmentedControl({
        options: ['Option 1', 'Option 2'],
        value: 'Option 2',
      });
      const selectedOption = screen.getByRole('button', { name: 'Option 2' });
      expect(selectedOption).toHaveStyle({
        backgroundColor: themes.light.backgroundColor.tertiary,
      });
    });
  });

  describe('when an option is clicked', () => {
    it('should call the onChange callback', async () => {
      const onChange = jest.fn();
      renderSegmentedControl({ onChange });
      const option = screen.getByRole('button', { name: 'Option 2' });
      await userEvent.click(option);
      expect(onChange).toHaveBeenCalledWith('Option 2');
    });
  });
});
