import { screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import { renderIdentify } from '../../../../../../config/tests/render';
import Verification, { VerificationProps } from './verification';

describe('<BiometricChallengeVerification />', () => {
  const renderVerification = ({
    isWaiting: isLoading,
    isSuccess,
    onComplete = () => {},
  }: Partial<VerificationProps>) =>
    renderIdentify(
      <Verification
        isWaiting={isLoading}
        isSuccess={isSuccess}
        onComplete={onComplete}
      />,
    );

  it('renders default state correctly', () => {
    renderVerification({});
    const button = screen.getByRole('button', { name: 'Launch biometrics' });
    expect(button).toBeInTheDocument();
  });

  it('renders loading correctly', () => {
    renderVerification({ isWaiting: true });
    expect(
      screen.queryByRole('button', { name: 'Launch biometrics' }),
    ).toBeNull();
    expect(screen.getByText('Waiting...')).toBeInTheDocument();
  });

  it('renders success correctly', () => {
    renderVerification({ isSuccess: true });
    expect(
      screen.queryByRole('button', { name: 'Launch biometrics' }),
    ).toBeNull();
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  it('calls onComplete when button is clicked', async () => {
    const onComplete = jest.fn();
    renderVerification({ onComplete });
    expect(onComplete).not.toHaveBeenCalled();
    const button = screen.getByRole('button', { name: 'Launch biometrics' });
    expect(button).toBeInTheDocument();
    await userEvent.click(button);
    expect(onComplete).toHaveBeenCalled();
  });
});
