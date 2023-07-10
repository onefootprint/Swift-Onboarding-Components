import { screen, userEvent, waitFor } from '@onefootprint/test-utils';
import React from 'react';

import { renderIdentify } from '../../../../config/tests/render';
import Form, { FormProps } from './form';

describe.skip('<Form />', () => {
  const renderForm = ({
    defaultPhone,
    isLoading,
    onSubmit = () => {},
  }: Partial<FormProps>) =>
    renderIdentify(
      <Form
        onSubmit={onSubmit}
        isLoading={isLoading}
        defaultPhone={defaultPhone}
      />,
    );

  it('should render correctly', async () => {
    renderForm({});

    const inputPhone = screen.getByText('Phone number');
    expect(inputPhone).toBeInTheDocument();

    const button = screen.getByRole('button', { name: 'Continue' });
    expect(button).toBeInTheDocument();
  });

  it('should render correctly with default phone number', async () => {
    renderForm({ defaultPhone: '(111) 111-1111' });

    const inputPhone = screen.getByDisplayValue('(111) 111-1111');
    expect(inputPhone).toBeInTheDocument();
  });

  it('should render correctly in loading state', async () => {
    renderForm({ isLoading: true });

    const button = screen.getByLabelText('Loading...');
    expect(button).toBeInTheDocument();
  });

  it('should call onSubmit when the form is submitted', async () => {
    const onSubmit = jest.fn();
    renderForm({ onSubmit });

    const inputPhone = screen.getByText('Phone number');
    await userEvent.type(inputPhone, '9999999999');

    const button = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(button);
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        {
          phoneNumber: '+1 (999) 999-9999',
        },
        expect.anything(),
      );
    });
  });

  it('should show error message when phone number is invalid', async () => {
    renderForm({});
    const input = screen.getByText('Phone number');
    await userEvent.type(input, '12');

    const button = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(button);

    const errorMessage = screen.getByText('Phone number is invalid');
    expect(errorMessage).toBeInTheDocument();
  });

  it('should show error message when phone number is empty', async () => {
    renderForm({});
    const button = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(button);

    const errorMessage = screen.getByText('Phone number cannot be empty');
    expect(errorMessage).toBeInTheDocument();
  });
});
