import IcoClose24 from 'icons/ico/ico-close-24';
import React from 'react';
import { customRender, screen, userEvent } from 'test-utils';

import IconButton, { IconButtonProps } from './icon-button';

describe('<IconButton />', () => {
  const renderIconButton = ({
    ariaLabel = 'close',
    Icon = IcoClose24,
    onClick,
    testID = 'icon-button-test-id',
  }: Partial<IconButtonProps>) => {
    customRender(
      <IconButton
        ariaLabel={ariaLabel}
        Icon={Icon}
        onClick={onClick}
        testID={testID}
      />,
    );
  };

  it('should assign a testID', () => {
    renderIconButton({});
    expect(screen.getByTestId('icon-button-test-id')).toBeTruthy();
  });

  it('should assign an aria label', () => {
    renderIconButton({
      ariaLabel: 'lorem',
    });
    expect(screen.getByLabelText('lorem')).toBeInTheDocument();
  });

  it('should trigger onClick when pressing', async () => {
    const onClickMockFn = jest.fn();
    renderIconButton({ ariaLabel: 'lorem', onClick: onClickMockFn });
    await userEvent.click(screen.getByLabelText('lorem'));
    expect(onClickMockFn).toHaveBeenCalled();
  });
});
