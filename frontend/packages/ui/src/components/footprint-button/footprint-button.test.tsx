import React from 'react';
import { customRender, screen, userEvent } from 'test-utils';

import FootprintButton, { FootprintButtonProps } from './footprint-button';

describe('<FootprintButton />', () => {
  const renderFootprintButton = ({
    disabled,
    onClick = jest.fn(),
    testID,
  }: Partial<FootprintButtonProps>) =>
    customRender(
      <FootprintButton disabled={disabled} onClick={onClick} testID={testID} />,
    );

  it('should assign a testID', () => {
    renderFootprintButton({ testID: 'footprint-button-test-id' });
    expect(screen.getByTestId('footprint-button-test-id')).toBeInTheDocument();
  });

  it('should render the text', () => {
    renderFootprintButton({});
    expect(
      screen.getByText('Verify with Footprint', { exact: false }),
    ).toBeInTheDocument();
  });

  it('should fire an event when pressing', async () => {
    const onClickMockFn = jest.fn();
    renderFootprintButton({ onClick: onClickMockFn });
    const button = screen.getByText('Verify with Footprint');
    await userEvent.click(button);
    expect(onClickMockFn).toHaveBeenCalled();
  });

  describe('when the button is disabled', () => {
    it('should NOT fire an event when pressing', () => {
      const onClickMockFn = jest.fn();
      renderFootprintButton({
        onClick: onClickMockFn,
        disabled: true,
      });
      userEvent.click(screen.getByText('Verify with Footprint'));
      expect(onClickMockFn).not.toHaveBeenCalled();
    });
  });
});
