import {
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import BasicDataForm, { BasicDataFormProps } from './basic-data-form';

describe('<BasicDataForm />', () => {
  const renderForm = ({
    defaultValues,
    isLoading = false,
    onSubmit = () => {},
    ctaLabel,
  }: Partial<BasicDataFormProps>) => {
    customRender(
      <BasicDataForm
        defaultValues={defaultValues}
        isLoading={isLoading}
        onSubmit={onSubmit}
        ctaLabel={ctaLabel}
      />,
    );
  };

  it('onsubmit gets called when submitting basic data', async () => {
    const onSubmit = jest.fn();
    renderForm({ onSubmit });

    const name = screen.getByLabelText('Business name');
    expect(screen.getByPlaceholderText('Acme Bank Inc.')).toBeInTheDocument();
    expect(name).toBeInTheDocument();
    await userEvent.type(name, 'Acme Inc.');

    const ein = screen.getByLabelText('Employer Identification Number (EIN)');
    expect(screen.getByPlaceholderText('12-3456789')).toBeInTheDocument();
    expect(ein).toBeInTheDocument();
    await userEvent.type(ein, '123231231');

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeInTheDocument();
    await userEvent.click(continueButton);
    await waitFor(() => {
      expect(onSubmit).toBeCalledWith({
        name: 'Acme Inc.',
        ein: '123231231',
      });
    });
  });

  it('renders custom cta label', () => {
    renderForm({ ctaLabel: 'Save' });
    const continueButton = screen.getByRole('button', { name: 'Save' });
    expect(continueButton).toBeInTheDocument();
  });

  it('renders default values', async () => {
    const onSubmit = jest.fn();
    renderForm({
      defaultValues: {
        name: 'Acme Inc.',
        ein: '99999999999',
      },
      onSubmit,
    });
    const name = screen.getByLabelText('Business name');
    expect(name).toHaveValue('Acme Inc.');
    const ein = screen.getByLabelText('Employer Identification Number (EIN)');
    expect(ein).toHaveValue(99999999999);

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeInTheDocument();
    await userEvent.click(continueButton);
    await waitFor(() => {
      expect(onSubmit).toBeCalledWith({
        name: 'Acme Inc.',
        ein: '99999999999',
      });
    });
  });
});
