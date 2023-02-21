import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import PhoneRegistrationForm, {
  PhoneRegistrationFormProps,
} from './phone-registration-form';

describe.skip('<PhoneRegistrationForm />', () => {
  const renderForm = ({
    defaultPhone,
    isLoading,
    onSubmit = () => {},
  }: Partial<PhoneRegistrationFormProps>) =>
    customRender(
      <PhoneRegistrationForm
        onSubmit={onSubmit}
        isLoading={isLoading}
        defaultPhone={defaultPhone}
      />,
    );

  it('should render correctly', async () => {
    renderForm({});
    expect(screen.getByText('Phone number')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('123-456-7890')).toBeInTheDocument();
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should render correctly with default phone number', async () => {
    renderForm({ defaultPhone: '111-111-1111' });
    expect(screen.getByLabelText('111-111-111')).toBeInTheDocument();
  });
  it('should render correctly in loading state', async () => {
    renderForm({ isLoading: true });
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should call onSubmit when the form is submitted', async () => {
    const onSubmit = jest.fn();
    renderForm({ onSubmit });
    const input = screen.getByPlaceholderText('123-456-7890');
    await userEvent.type(input, '9999999999');
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(onSubmit).toHaveBeenCalledWith(
      {
        phone_number: '9999999999',
      },
      expect.anything(),
    );
  });

  it('should show error message when phone number is invalid', async () => {
    renderForm({});
    const input = screen.getByPlaceholderText('123-456-7890');
    await userEvent.type(input, '1234567890');
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(
      screen.getByText('Please enter a valid phone number.'),
    ).toBeInTheDocument();
  });

  it('should show error message when phone number is empty', async () => {
    renderForm({});
    const input = screen.getByPlaceholderText('123-456-7890');
    await userEvent.clear(input);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(
      screen.getByText('Please enter a valid phone number.'),
    ).toBeInTheDocument();
  });
});
