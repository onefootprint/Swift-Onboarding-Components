import { screen, userEvent, waitFor, within } from '@onefootprint/test-utils';
import React from 'react';

import { renderIdentify } from '../../../../config/tests/render';
import type { FormProps } from './form';
import Form from './form';

describe.skip('<Form />', () => {
  const renderForm = ({
    defaultEmail,
    isLoading,
    onSubmit = () => {},
  }: Partial<FormProps>) =>
    renderIdentify(
      <Form
        defaultEmail={defaultEmail}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />,
    );

  it('should render correctly', async () => {
    renderForm({});
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('jane.doe@acme.com'),
    ).toBeInTheDocument();
    const button = screen.getByRole('button', { name: 'Continue' });
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
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(2);
    const continueButton = buttons[0];
    expect(within(continueButton).getByRole('progressbar')).toBeInTheDocument();
  });

  it('should call onsubmit with valid data', async () => {
    const onSubmit = jest.fn();
    renderForm({
      onSubmit,
    });
    const input = screen.getByLabelText('Email');
    expect(input).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('jane.doe@acme.com'),
    ).toBeInTheDocument();

    await userEvent.type(input, 'footprint@onefootprint.com');
    const button = screen.getByRole('button', { name: 'Continue' });
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

    const button = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });
});
