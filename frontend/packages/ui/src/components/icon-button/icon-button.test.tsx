import IcoClose24 from 'icons/ico/ico-close-24';
import React from 'react';
import { customRender, screen, userEvent } from 'test-utils';

import IconButton, { IconButtonProps } from './icon-button';

describe('<IconButton />', () => {
  const renderIconButton = ({
    'aria-label': ariaLabel = 'Close',
    iconComponent: Icon = IcoClose24,
    onClick,
    testID = 'icon-button-test-id',
  }: Partial<IconButtonProps>) => {
    customRender(
      <IconButton
        aria-label={ariaLabel}
        iconComponent={Icon}
        onClick={onClick}
        testID={testID}
      />,
    );
  };

  it('should assign a testID', () => {
    renderIconButton({});
    expect(screen.getByTestId('icon-button-test-id')).toBeInTheDocument();
  });

  it('should assign an aria label', () => {
    renderIconButton({
      'aria-label': 'lorem',
    });
    expect(screen.getByLabelText('lorem')).toBeInTheDocument();
  });

  it('should trigger onClick when pressing', async () => {
    const onClickMockFn = jest.fn();
    renderIconButton({ 'aria-label': 'lorem', onClick: onClickMockFn });
    await userEvent.click(screen.getByLabelText('lorem'));
    expect(onClickMockFn).toHaveBeenCalled();
  });
});
