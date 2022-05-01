import React from 'react';
import { customRender, screen, userEvent } from 'test-utils';

import Button, { ButtonProps } from './button';

describe('<Button />', () => {
  const renderButton = ({
    children = 'Foo',
    disabled,
    onPress = jest.fn(),
    testID,
    variant,
  }: Partial<ButtonProps>) =>
    customRender(
      <Button
        disabled={disabled}
        onPress={onPress}
        testID={testID}
        variant={variant}
      >
        {children}
      </Button>,
    );

  it('should assign a testID', () => {
    renderButton({ testID: 'button-test-id' });
    expect(screen.getByTestId('button-test-id')).toBeTruthy();
  });

  it('should render the text', () => {
    renderButton({ children: 'Lorem' });
    expect(screen.getByText('Lorem')).toBeTruthy();
  });

  it('should fire an event when pressing', async () => {
    const onPressMockFn = jest.fn();
    renderButton({ onPress: onPressMockFn, children: 'foo' });
    await userEvent.click(screen.getByText('foo'));
    expect(onPressMockFn).toHaveBeenCalled();
  });

  describe('when the button is disabled', () => {
    it('should NOT fire an event when pressing', () => {
      const onPressMockFn = jest.fn();
      renderButton({ onPress: onPressMockFn, children: 'foo', disabled: true });
      userEvent.click(screen.getByText('foo'));
      expect(onPressMockFn).not.toHaveBeenCalled();
    });
  });
});
