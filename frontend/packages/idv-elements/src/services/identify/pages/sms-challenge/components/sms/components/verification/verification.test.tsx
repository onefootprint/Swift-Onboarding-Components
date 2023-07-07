import { MockDate, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import React from 'react';

import { renderIdentify } from '../../../../../../config/tests/render';
import Verification, { VerificationProps } from './verification';

const testDate = new Date('2023-01-19T14:10:20.503Z');
const futureDate = new Date('2043-01-19T14:10:20.503Z');

describe('<Verification />', () => {
  beforeAll(() => {
    MockDate.set(testDate);
  });

  afterAll(() => {
    MockDate.reset();
  });

  const renderVerification = ({
    title,
    isVerifying,
    isSuccess,
    hasError,
    onComplete = () => {},
    resendDisabledUntil,
    onResend = () => {},
    isResendLoading,
  }: Partial<VerificationProps>) =>
    renderIdentify(
      <Verification
        title={title}
        isVerifying={isVerifying}
        isSuccess={isSuccess}
        hasError={hasError}
        onComplete={onComplete}
        resendDisabledUntil={resendDisabledUntil}
        onResend={onResend}
        isResendLoading={isResendLoading}
      />,
    );

  it('renders default state with title correctly', () => {
    renderVerification({ title: 'Title' });
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Resend code')).toBeInTheDocument();
    expect(
      screen.getByTestId('sms-challenge-verification-pin-input'),
    ).toBeInTheDocument();
    const button = screen.getByRole('button', { name: 'Resend code' });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('renders verifying correctly', () => {
    renderVerification({ isVerifying: true });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Verifying...')).toBeInTheDocument();
    expect(screen.queryByText('Resend code')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('sms-challenge-verification-pin-input'),
    ).not.toBeInTheDocument();
  });

  it('renders success correctly', () => {
    renderVerification({ isSuccess: true });
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.queryByText('Resend code')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('sms-challenge-verification-pin-input'),
    ).not.toBeInTheDocument();
  });

  it('renders error correctly', () => {
    renderVerification({ hasError: true });
    expect(
      screen.getByTestId('sms-challenge-verification-pin-input'),
    ).toBeInTheDocument();
    const button = screen.getByRole('button', { name: 'Resend code' });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    expect(screen.getByText('Incorrect code')).toBeInTheDocument();
  });

  it('calls onComplete correctly', async () => {
    const onComplete = jest.fn();
    renderVerification({ onComplete });
    const firstInput = document.getElementsByTagName('input')[0];
    firstInput.focus();
    await userEvent.keyboard('123456');
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it('calls onResend correctly', async () => {
    const onResend = jest.fn();
    renderVerification({ onResend });
    const button = screen.getByRole('button', { name: 'Resend code' });
    await userEvent.click(button);
    expect(onResend).toHaveBeenCalled();
  });

  it('renders button correctly when resend is enabled', () => {
    renderVerification({});
    const button = screen.getByRole('button', { name: 'Resend code' });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('renders button correctly when resend is loading', async () => {
    const onResend = jest.fn();
    renderVerification({ onResend, isResendLoading: true });
    expect(
      screen.getByTestId('sms-challenge-verification-pin-input'),
    ).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders button correctly when resend is disabled', async () => {
    const onResend = jest.fn();
    renderVerification({ onResend, resendDisabledUntil: futureDate });
    const button = screen.getByRole('button', { name: 'Resend code' });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();

    await userEvent.click(button);
    await waitFor(() => {
      expect(
        screen.getByText(/Please wait [0-9].+ seconds to resend it.../i),
      ).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(button).toBeDisabled();
    });
    expect(onResend).not.toHaveBeenCalled();
  });
});
