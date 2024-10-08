import '../../config/initializers/i18next-test';

import { IcoClose24 } from '@onefootprint/icons';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender } from '../../utils/test-utils';

import type { IconButtonProps } from './icon-button';
import IconButton from './icon-button';

describe('<IconButton />', () => {
  const renderIconButton = ({
    'aria-label': ariaLabel = 'Close',
    onClick,
    testID = 'icon-button-test-id',
  }: Partial<IconButtonProps>) => {
    customRender(
      <IconButton aria-label={ariaLabel} onClick={onClick} testID={testID}>
        <IcoClose24 />
      </IconButton>,
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
