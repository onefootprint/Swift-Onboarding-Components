import {
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import { BusinessDataAttribute } from '@onefootprint/types';
import React from 'react';

import BasicDataForm, { BasicDataFormProps } from './basic-data-form';

describe('<BasicDataForm />', () => {
  const renderForm = ({
    defaultValues,
    optionalFields,
    isLoading = false,
    onSubmit = () => {},
    ctaLabel,
  }: Partial<BasicDataFormProps>) => {
    customRender(
      <BasicDataForm
        optionalFields={optionalFields}
        defaultValues={defaultValues}
        isLoading={isLoading}
        onSubmit={onSubmit}
        ctaLabel={ctaLabel}
      />,
    );
  };

  // TODO: unskip test when bug resolved, and add tests for phone number error state below
  // https://linear.app/footprint/issue/FP-2843/phoneinput-dynamic-import-causes-node-segfault
  it.skip('onsubmit gets called when submitting basic data', async () => {
    const onSubmit = jest.fn();
    renderForm({
      onSubmit,
      optionalFields: [
        BusinessDataAttribute.phoneNumber,
        BusinessDataAttribute.website,
      ],
    });

    const name = screen.getByLabelText('Business name');
    expect(screen.getByPlaceholderText('Acme Bank Inc.')).toBeInTheDocument();
    expect(name).toBeInTheDocument();
    await userEvent.type(name, 'Acme Inc.');

    const tin = screen.getByLabelText('Taxpayer Identification Number (TIN)');
    expect(screen.getByPlaceholderText('12-3456789')).toBeInTheDocument();
    expect(tin).toBeInTheDocument();
    await userEvent.type(tin, '129876543');

    const phoneNumber = screen.getByLabelText('Phone number');
    expect(phoneNumber).toBeInTheDocument();
    expect(screen.getByPlaceholderText('123-456-7890')).toBeInTheDocument();
    await userEvent.type(phoneNumber, '6594539494');

    const website = screen.getByLabelText('Business website');
    expect(website).toBeInTheDocument();
    expect(screen.getByPlaceholderText('www.acme.com')).toBeInTheDocument();
    await userEvent.type(website, 'www.acme.com');

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeInTheDocument();
    await userEvent.click(continueButton);
    await waitFor(() => {
      expect(onSubmit).toBeCalledWith({
        name: 'Acme Inc.',
        tin: '12-9876543',
        phoneNumber: '6594539494',
        website: 'www.acme.com',
      });
    });
  });

  it('hides some attributes', async () => {
    const onSubmit = jest.fn();
    renderForm({
      onSubmit,
    });

    const name = screen.getByLabelText('Business name');
    expect(screen.getByPlaceholderText('Acme Bank Inc.')).toBeInTheDocument();
    expect(name).toBeInTheDocument();
    await userEvent.type(name, 'Acme Inc.');

    const tin = screen.getByLabelText('Taxpayer Identification Number (TIN)');
    expect(screen.getByPlaceholderText('12-3456789')).toBeInTheDocument();
    expect(tin).toBeInTheDocument();
    await userEvent.type(tin, '129876543');

    const phoneNumber = screen.queryByLabelText('Phone number');
    expect(phoneNumber).not.toBeInTheDocument();

    const website = screen.queryByLabelText('Website');
    expect(website).not.toBeInTheDocument();

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeInTheDocument();
    await userEvent.click(continueButton);
    await waitFor(() => {
      expect(onSubmit).toBeCalledWith({
        name: 'Acme Inc.',
        tin: '12-9876543',
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
        tin: '98-7654321',
      },
      onSubmit,
    });
    const name = screen.getByLabelText('Business name');
    expect(name).toHaveValue('Acme Inc.');
    const tin = screen.getByLabelText('Taxpayer Identification Number (TIN)');
    expect(tin).toHaveValue('98-7654321');

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeInTheDocument();
    await userEvent.click(continueButton);
    await waitFor(() => {
      expect(onSubmit).toBeCalledWith({
        name: 'Acme Inc.',
        tin: '98-7654321',
      });
    });
  });

  it('renders error when submitting empty form', async () => {
    const onSubmit = jest.fn();
    renderForm({ onSubmit });

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeInTheDocument();
    await userEvent.click(continueButton);
    await waitFor(() => {
      expect(onSubmit).not.toBeCalled();
    });
    await waitFor(() => {
      expect(
        screen.getByText('Business name cannot be empty or is invalid'),
      ).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(
        screen.getByText('TIN cannot be empty or is invalid'),
      ).toBeInTheDocument();
    });
  });
});
