import { screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import { renderIdentify } from '../../../../config/tests/render';
import LoginWithDifferentAccount, {
  LoginWithDifferentAccountProps,
} from './login-with-different-account';

describe('<LoginWithDifferentAccount />', () => {
  const renderComponent = ({
    onClick = jest.fn(),
    showMissingPhoneLabel = true,
  }: Partial<LoginWithDifferentAccountProps>) =>
    renderIdentify(
      <LoginWithDifferentAccount
        showMissingPhoneLabel={showMissingPhoneLabel}
        onClick={onClick}
      />,
    );

  it('should render successfully', () => {
    renderComponent({});
    expect(
      screen.getByText('Login with a different account'),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Don't have access to this phone number?"),
    ).toBeInTheDocument();
  });

  it('should hide missing phone label', () => {
    renderComponent({ showMissingPhoneLabel: false });
    expect(
      screen.getByText('Login with a different account'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Don't have access to this phone number?"),
    ).toBeNull();
  });

  it('should call onLoginWithDifferentAccount when clicked', async () => {
    const onClick = jest.fn();
    renderComponent({ onClick });
    await userEvent.click(screen.getByText('Login with a different account'));
    expect(onClick).toHaveBeenCalled();
  });
});
