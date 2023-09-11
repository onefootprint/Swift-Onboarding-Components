import { MockDate, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import React from 'react';

import { renderIdentify } from '../../../../config/tests/render';
import type { FormProps } from './form';
import Form from './form';

const testDate = new Date('2023-01-19T14:10:20.503Z');
const futureDate = new Date('2043-01-19T14:10:20.503Z');

describe('<Form />', () => {
  beforeAll(() => {
    MockDate.set(testDate);
  });

  afterAll(() => {
    MockDate.reset();
  });

  const renderForm = ({
    title,
    isVerifying,
    isSuccess,
    hasError,
    onComplete = () => {},
    resendDisabledUntil,
    onResend = () => {},
    isResendLoading,
  }: Partial<FormProps>) =>
    renderIdentify(
      <Form
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
    renderForm({ title: 'Title' });
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Resend code')).toBeInTheDocument();
    expect(
      screen.getByTestId('verification-form-pin-input'),
    ).toBeInTheDocument();
    const button = screen.getByRole('button', { name: 'Resend code' });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('renders verifying correctly', () => {
    renderForm({ isVerifying: true });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Verifying...')).toBeInTheDocument();
    expect(screen.queryByText('Resend code')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('verification-form-pin-input'),
    ).not.toBeInTheDocument();
  });

  it('renders success correctly', () => {
    renderForm({ isSuccess: true });
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.queryByText('Resend code')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('verification-form-pin-input'),
    ).not.toBeInTheDocument();
  });

  it('renders error correctly', () => {
    renderForm({ hasError: true });
    expect(
      screen.getByTestId('verification-form-pin-input'),
    ).toBeInTheDocument();
    const button = screen.getByRole('button', { name: 'Resend code' });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    expect(screen.getByText('Incorrect code')).toBeInTheDocument();
  });

  it('calls onComplete correctly', async () => {
    const onComplete = jest.fn();
    renderForm({ onComplete });
    const firstInput = document.getElementsByTagName('input')[0];
    firstInput.focus();
    await userEvent.keyboard('123456');
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it('calls onResend correctly', async () => {
    const onResend = jest.fn();
    renderForm({ onResend });
    const button = screen.getByRole('button', { name: 'Resend code' });
    await userEvent.click(button);
    expect(onResend).toHaveBeenCalled();
  });

  it('renders button correctly when resend is enabled', () => {
    renderForm({});
    const button = screen.getByRole('button', { name: 'Resend code' });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('renders button correctly when resend is loading', async () => {
    const onResend = jest.fn();
    renderForm({ onResend, isResendLoading: true });
    expect(
      screen.getByTestId('verification-form-pin-input'),
    ).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders button correctly when resend is disabled', async () => {
    const onResend = jest.fn();
    renderForm({ onResend, resendDisabledUntil: futureDate });
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
