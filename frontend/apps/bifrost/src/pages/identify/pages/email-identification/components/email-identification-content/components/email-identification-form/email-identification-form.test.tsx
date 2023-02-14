import {
  customRender,
  screen,
  userEvent,
  within,
} from '@onefootprint/test-utils';
import React from 'react';

import EmailIdentificationForm, {
  EmailIdentificationFormProps,
} from './email-identification-form';

describe('<EmailIdentificationForm />', () => {
  const renderForm = ({
    defaultEmail,
    isLoading,
    isSandbox,
    onSubmit = () => {},
  }: Partial<EmailIdentificationFormProps>) =>
    customRender(
      <EmailIdentificationForm
        defaultEmail={defaultEmail}
        isSandbox={isSandbox}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />,
    );

  it('should render correctly', async () => {
    renderForm({});
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('your.email@email.com'),
    ).toBeInTheDocument();
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should render correctly in sandbox mode', async () => {
    renderForm({ isSandbox: true });
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Add ”#string” (e.g., #test1) at the end of your email address.',
      ),
    ).toBeInTheDocument();
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should render correctly with default email', async () => {
    renderForm({ defaultEmail: 'piip@onefootprint.com' });
    expect(
      screen.getByDisplayValue('piip@onefootprint.com'),
    ).toBeInTheDocument();
  });

  it('should render correctly in loading state', async () => {
    const onSubmit = jest.fn();
    renderForm({
      onSubmit,
      isLoading: true,
      defaultEmail: 'piip@onefootprint.com',
    });
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.queryByLabelText('piip@onefootprint.com')).toBeNull();
    const button = screen.getByRole('button');
    expect(within(button).getByRole('progressbar')).toBeInTheDocument();
  });

  it('should call onsubmit with valid data', async () => {
    const onSubmit = jest.fn();
    renderForm({
      onSubmit,
    });
    const input = screen.getByLabelText('Email');
    expect(input).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('your.email@email.com'),
    ).toBeInTheDocument();

    await userEvent.type(input, 'footprint@onefootprint.com');
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(onSubmit).toHaveBeenCalledWith(
      {
        email: 'footprint@onefootprint.com',
      },
      expect.anything(),
    );
  });

  it('should show error submitted with empty email', async () => {
    const onSubmit = jest.fn();
    renderForm({ onSubmit });

    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('should show error if sandbox email is invalid', async () => {
    const onSubmit = jest.fn();
    renderForm({
      onSubmit,
      isSandbox: true,
      defaultEmail: 'piip@onefootprint.com',
    });

    const button = screen.getByRole('button');
    await userEvent.click(button);

    expect(
      screen.getByText(
        'Add ”#string” (e.g., #test1) at the end of your email address.',
      ),
    ).toBeInTheDocument();
  });
});
