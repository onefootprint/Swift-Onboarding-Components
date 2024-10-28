import '../../config/initializers/i18next-test';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender } from '../../utils/test-utils';

import type { GoogleButtonProps } from './google-button';
import GoogleButton from './google-button';

describe('<GoogleButton />', () => {
  const renderGoogleButton = ({
    children = 'Foo',
    disabled,
    loading,
    loadingAriaLabel,
    onClick = jest.fn(),
    testID,
  }: Partial<GoogleButtonProps>) =>
    customRender(
      <GoogleButton
        disabled={disabled}
        loading={loading}
        loadingAriaLabel={loadingAriaLabel}
        onClick={onClick}
        testID={testID}
      >
        {children}
      </GoogleButton>,
    );

  it('should assign a testID', () => {
    renderGoogleButton({ testID: 'google-button-test-id' });
    expect(screen.getByTestId('google-button-test-id')).toBeInTheDocument();
  });

  it('should render the text', () => {
    renderGoogleButton({ children: 'Lorem' });
    expect(screen.getByText('Lorem')).toBeInTheDocument();
  });

  it('should trigger onClick when pressing', async () => {
    const onClickMockFn = jest.fn();
    renderGoogleButton({ onClick: onClickMockFn, children: 'foo' });
    await userEvent.click(screen.getByText('foo'));
    expect(onClickMockFn).toHaveBeenCalled();
  });

  describe('when the button is disabled', () => {
    it('should NOT fire an event when pressing', async () => {
      const onClickMockFn = jest.fn();
      renderGoogleButton({
        onClick: onClickMockFn,
        children: 'foo',
        disabled: true,
      });
      await userEvent.click(screen.getByText('foo'));
      expect(onClickMockFn).not.toHaveBeenCalled();
    });
  });

  describe('when the button is loading', () => {
    it('should show the loading spinner', () => {
      renderGoogleButton({ loading: true, loadingAriaLabel: 'Loading...' });
      expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
    });
  });
});
