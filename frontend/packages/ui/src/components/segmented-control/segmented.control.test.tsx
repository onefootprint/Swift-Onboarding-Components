import '../../config/initializers/i18next-test';

import themes from '@onefootprint/design-tokens';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender } from '../../utils/test-utils';

import type { SegmentedControlProps } from './segmented-control';
import SegmentedControl from './segmented-control';

describe('<SegmentedControl />', () => {
  const renderSegmentedControl = ({
    'aria-label': ariaLabel = 'Segmented Control',
    onChange = jest.fn(),
    options = [
      {
        label: 'Option 1',
        value: 'option-1',
      },
      {
        label: 'Option 2',
        value: 'option-2',
      },
    ],
    value = 'option-1',
    variant = 'primary',
    size = 'default',
  }: Partial<SegmentedControlProps>) =>
    customRender(
      <SegmentedControl
        aria-label={ariaLabel}
        onChange={onChange}
        options={options}
        value={value}
        variant={variant}
        size={size}
      />,
    );

  it('should render two options', () => {
    renderSegmentedControl({});
    const options = screen.getAllByRole('button');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('Option 1');
    expect(options[1]).toHaveTextContent('Option 2');
  });

  it('should render three options', () => {
    const threeOptions = [
      { label: 'Option 1', value: 'option-1' },
      { label: 'Option 2', value: 'option-2' },
      { label: 'Option 3', value: 'option-3' },
    ];
    renderSegmentedControl({ options: threeOptions });
    const options = screen.getAllByRole('button');
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('Option 1');
    expect(options[1]).toHaveTextContent('Option 2');
    expect(options[2]).toHaveTextContent('Option 3');
  });

  describe('when an option is selected', () => {
    describe('primary variant', () => {
      it('should have a different style in order to highlight it', () => {
        renderSegmentedControl({
          value: 'option-2',
          variant: 'primary',
        });
        const selectedOption = screen.getByRole('button', { name: 'Option 2' });
        expect(selectedOption).toHaveStyle({
          backgroundColor: themes.light.backgroundColor.primary,
          color: themes.light.color.primary,
        });
      });

      it('should have the correct background color for non-selected options', () => {
        renderSegmentedControl({
          value: 'option-2',
          variant: 'primary',
        });
        const nonSelectedOption = screen.getByRole('button', { name: 'Option 1' });
        expect(nonSelectedOption).toHaveStyle({
          backgroundColor: themes.light.backgroundColor.secondary,
        });
      });
    });

    describe('secondary variant', () => {
      it('should have a different style in order to highlight it', () => {
        renderSegmentedControl({
          value: 'option-2',
          variant: 'secondary',
        });
        const selectedOption = screen.getByRole('button', { name: 'Option 2' });
        expect(selectedOption).toHaveStyle({
          backgroundColor: themes.light.backgroundColor.primary,
          color: themes.light.color.primary,
        });
      });

      it('should have the correct background color for non-selected options', () => {
        renderSegmentedControl({
          value: 'option-2',
          variant: 'secondary',
        });
        const nonSelectedOption = screen.getByRole('button', { name: 'Option 1' });
        expect(nonSelectedOption).toHaveStyle({
          backgroundColor: themes.light.backgroundColor.senary,
        });
      });
    });
  });

  describe('when an option is clicked', () => {
    it('should call the onChange callback', async () => {
      const onChange = jest.fn();
      renderSegmentedControl({ onChange });
      const option = screen.getByRole('button', { name: 'Option 2' });
      await userEvent.click(option);
      expect(onChange).toHaveBeenCalledWith('option-2');
    });
  });

  describe('when using different sizes', () => {
    it('should have correct padding for default size', () => {
      renderSegmentedControl({ size: 'default' });
      const option = screen.getByRole('button', { name: 'Option 1' });
      expect(option).toHaveStyle({
        padding: `${themes.light.spacing[2]} ${themes.light.spacing[4]}`,
      });
    });

    it('should have correct padding for compact size', () => {
      renderSegmentedControl({ size: 'compact' });
      const option = screen.getByRole('button', { name: 'Option 1' });
      expect(option).toHaveStyle({
        padding: `${themes.light.spacing[1]} ${themes.light.spacing[4]}`,
      });
    });
  });
});
