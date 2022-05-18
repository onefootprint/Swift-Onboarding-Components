import React from 'react';
import { customRender, screen, userEvent } from 'test-utils';

import Button, { ButtonProps } from './button';

describe('<Button />', () => {
  const renderButton = ({
    children = 'Foo',
    disabled,
    onClick = jest.fn(),
    testID,
    variant,
  }: Partial<ButtonProps>) =>
    customRender(
      <Button
        disabled={disabled}
        onClick={onClick}
        testID={testID}
        variant={variant}
      >
        {children}
      </Button>,
    );

  it('should assign a testID', () => {
    renderButton({ testID: 'button-test-id' });
    expect(screen.getByTestId('button-test-id')).toBeInTheDocument();
  });

  it('should render the text', () => {
    renderButton({ children: 'Lorem' });
    expect(screen.getByText('Lorem')).toBeInTheDocument();
  });

  it('should trigger onClick when pressing', async () => {
    const onClickMockFn = jest.fn();
    renderButton({ onClick: onClickMockFn, children: 'foo' });
    await userEvent.click(screen.getByText('foo'));
    expect(onClickMockFn).toHaveBeenCalled();
  });

  describe('when the button is disabled', () => {
    it('should NOT fire an event when pressing', () => {
      const onClickMockFn = jest.fn();
      renderButton({ onClick: onClickMockFn, children: 'foo', disabled: true });
      userEvent.click(screen.getByText('foo'));
      expect(onClickMockFn).not.toHaveBeenCalled();
    });
  });
});
