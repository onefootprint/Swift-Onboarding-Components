import React from 'react';
import { customRender, screen, userEvent } from 'test-utils';

import FootprintButton, { FootprintButtonProps } from './footprint-button';

describe('<FootprintButton />', () => {
  const renderFootprintButton = ({
    disabled,
    onPress = jest.fn(),
    testID,
    variant,
  }: Partial<FootprintButtonProps>) =>
    customRender(
      <FootprintButton
        disabled={disabled}
        onPress={onPress}
        testID={testID}
        variant={variant}
      />,
    );

  it('should assign a testID', () => {
    renderFootprintButton({ testID: 'footprint-button-test-id' });
    expect(screen.getByTestId('footprint-button-test-id')).toBeTruthy();
  });

  it('should render the text', () => {
    renderFootprintButton({});
    expect(
      screen.getByText('Verify with Footprint', { exact: false }),
    ).toBeTruthy();
  });

  it('should fire an event when pressing', async () => {
    const onPressMockFn = jest.fn();
    renderFootprintButton({ onPress: onPressMockFn });
    const button = screen.getByText('Verify with Footprint');
    await userEvent.click(button);
    expect(onPressMockFn).toHaveBeenCalled();
  });

  describe('when the button is disabled', () => {
    it('should NOT fire an event when pressing', () => {
      const onPressMockFn = jest.fn();
      renderFootprintButton({
        onPress: onPressMockFn,
        disabled: true,
      });
      userEvent.click(screen.getByText('Verify with Footprint'));
      expect(onPressMockFn).not.toHaveBeenCalled();
    });
  });
});
