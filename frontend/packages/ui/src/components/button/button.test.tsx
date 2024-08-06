import '../../config/initializers/i18next-test';

import { customRender, screen, userEvent } from '@onefootprint/test-utils';

import type { ButtonProps } from './button';
import Button from './button';

describe('<Button />', () => {
  const renderButton = ({
    children = 'Foo',
    disabled,
    loading,
    loadingAriaLabel,
    onClick = jest.fn(),
    testID,
    variant,
  }: Partial<ButtonProps>) =>
    customRender(
      <Button
        disabled={disabled}
        loading={loading}
        loadingAriaLabel={loadingAriaLabel}
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
    it('should NOT fire an event when pressing', async () => {
      const onClickMockFn = jest.fn();
      renderButton({ onClick: onClickMockFn, children: 'foo', disabled: true });
      await userEvent.click(screen.getByText('foo'));
      expect(onClickMockFn).not.toHaveBeenCalled();
    });
  });

  describe('when the button is loading', () => {
    it('should show the loading spinner', () => {
      renderButton({ loading: true, loadingAriaLabel: 'Loading...' });
      expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
    });
  });
});
