import '../../config/initializers/i18next-test';

import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import type { FootprintButtonProps } from './footprint-button';
import FootprintButton from './footprint-button';

describe('<FootprintButton />', () => {
  const renderFootprintButton = ({
    disabled,
    onClick = jest.fn(),
    testID,
    loading,
    loadingAriaLabel,
  }: Partial<FootprintButtonProps>) =>
    customRender(
      <FootprintButton
        disabled={disabled}
        onClick={onClick}
        testID={testID}
        loading={loading}
        loadingAriaLabel={loadingAriaLabel}
      />,
    );

  it('should assign a testID', () => {
    renderFootprintButton({ testID: 'footprint-button-test-id' });
    expect(screen.getByTestId('footprint-button-test-id')).toBeInTheDocument();
  });

  it('should render the text', () => {
    renderFootprintButton({});
    expect(screen.getByText('Verify with Footprint', { exact: false })).toBeInTheDocument();
  });

  it('should fire an event when pressing', async () => {
    const onClickMockFn = jest.fn();
    renderFootprintButton({ onClick: onClickMockFn });
    const button = screen.getByText('Verify with Footprint');
    await userEvent.click(button);
    expect(onClickMockFn).toHaveBeenCalled();
  });

  describe('when the button is disabled', () => {
    it('should NOT fire an event when pressing', async () => {
      const onClickMockFn = jest.fn();
      renderFootprintButton({
        onClick: onClickMockFn,
        disabled: true,
      });
      await userEvent.click(screen.getByText('Verify with Footprint'));
      expect(onClickMockFn).not.toHaveBeenCalled();
    });
  });

  describe('when the button is loading', () => {
    it('should show the loading spinner', () => {
      renderFootprintButton({ loading: true, loadingAriaLabel: 'Loading...' });
      expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
    });
  });
});
