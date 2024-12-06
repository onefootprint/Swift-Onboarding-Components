import '../../../../../../config/initializers/i18next-test';

import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { BusinessDI, CollectedKybDataOption } from '@onefootprint/types';

import type { BasicDataFormProps } from './basic-data-form';
import BasicDataForm from './basic-data-form';

describe('<BasicDataForm />', () => {
  const renderForm = ({
    defaultValues,
    allAttributes,
    isLoading = false,
    onSubmit = () => undefined,
    ctaLabel,
  }: Partial<BasicDataFormProps>) => {
    customRender(
      <BasicDataForm
        allAttributes={allAttributes || []}
        defaultValues={defaultValues}
        isLoading={isLoading}
        onSubmit={onSubmit}
        ctaLabel={ctaLabel}
      />,
    );
  };

  it('render a custom cta label', () => {
    renderForm({ ctaLabel: 'Save', allAttributes: [CollectedKybDataOption.name, CollectedKybDataOption.tin] });
    const continueButton = screen.getByRole('button', { name: 'Save' });
    expect(continueButton).toBeInTheDocument();
  });

  it('should call onSubmit after submit the user data', async () => {
    const onSubmit = jest.fn();
    renderForm({
      onSubmit,
      allAttributes: [
        CollectedKybDataOption.name,
        CollectedKybDataOption.tin,
        CollectedKybDataOption.phoneNumber,
        CollectedKybDataOption.website,
      ],
    });

    const name = screen.getByLabelText('Legal business name');
    await userEvent.type(name, 'Acme Inc.');

    const tin = screen.getByLabelText('Taxpayer Identification Number (TIN)');
    await userEvent.type(tin, '129876543');

    const phoneNumber = screen.getByLabelText('Phone number');
    await userEvent.type(phoneNumber, '6594539494');

    const website = screen.getByLabelText('Website');
    await userEvent.type(website, 'https://acme.com');

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(continueButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        'business.dba': undefined,
        'business.name': 'Acme Inc.',
        'business.phone_number': '+1 (659) 453-9494',
        'business.tin': '12-9876543',
        'business.website': 'https://acme.com',
      });
    });
  });

  describe('when phone number, website, and tin are not collected', () => {
    it('should hide', async () => {
      const onSubmit = jest.fn();
      renderForm({
        onSubmit,
        allAttributes: [CollectedKybDataOption.name],
      });

      const name = screen.getByLabelText('Legal business name');
      await userEvent.type(name, 'Acme Inc.');

      const dba = screen.getByLabelText('Doing Business As (optional)');
      await userEvent.type(dba, 'Acme');

      const tin = screen.queryByLabelText('Taxpayer Identification Number (TIN)');
      expect(tin).not.toBeInTheDocument();

      const phoneNumber = screen.queryByLabelText('Phone number');
      expect(phoneNumber).not.toBeInTheDocument();

      const website = screen.queryByLabelText('Website');
      expect(website).not.toBeInTheDocument();

      const continueButton = screen.getByRole('button', { name: 'Continue' });
      expect(continueButton).toBeInTheDocument();
      await userEvent.click(continueButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          [BusinessDI.name]: 'Acme Inc.',
          [BusinessDI.doingBusinessAs]: 'Acme',
        });
      });
    });
  });

  describe('when defaultValues is set', () => {
    it('should prefill the fields', async () => {
      const onSubmit = jest.fn();
      renderForm({
        defaultValues: {
          name: 'Acme Inc.',
          tin: '98-7654321',
        },
        allAttributes: [CollectedKybDataOption.name, CollectedKybDataOption.tin],
        onSubmit,
      });

      const name = screen.getByLabelText('Legal business name');
      expect(name).toHaveValue('Acme Inc.');

      const tin = screen.getByLabelText('Taxpayer Identification Number (TIN)');
      expect(tin).toHaveValue('98-7654321');

      const continueButton = screen.getByRole('button', { name: 'Continue' });
      expect(continueButton).toBeInTheDocument();
      await userEvent.click(continueButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          [BusinessDI.name]: 'Acme Inc.',
          [BusinessDI.tin]: '98-7654321',
        });
      });
    });
  });

  describe('when the form is submitted incorrectly', () => {
    it('should show an error message', async () => {
      const onSubmit = jest.fn();
      renderForm({
        onSubmit,
      });

      const continueButton = screen.getByRole('button', { name: 'Continue' });
      expect(continueButton).toBeInTheDocument();

      await userEvent.click(continueButton);
      await waitFor(() => {
        expect(onSubmit).not.toHaveBeenCalled();
      });
      await waitFor(() => {
        expect(screen.getByText('Business name cannot be empty or is invalid')).toBeInTheDocument();
      });
    });

    it('should show an error message for fields that arent always collected', async () => {
      const onSubmit = jest.fn();
      renderForm({
        onSubmit,
        allAttributes: [
          CollectedKybDataOption.name,
          CollectedKybDataOption.phoneNumber,
          CollectedKybDataOption.website,
          CollectedKybDataOption.tin,
        ],
      });

      const continueButton = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText('Phone number cannot be empty')).toBeInTheDocument();
      });
      expect(screen.getByText('Website cannot be empty or is invalid')).toBeInTheDocument();
      expect(screen.getByText('TIN cannot be empty or is invalid')).toBeInTheDocument();
    });

    it('should validate phone on submit function', async () => {
      const onSubmit = jest.fn();
      renderForm({
        onSubmit,
        allAttributes: [
          CollectedKybDataOption.phoneNumber,
          CollectedKybDataOption.website,
          CollectedKybDataOption.tin,
          CollectedKybDataOption.name,
        ],
      });

      const name = screen.getByLabelText('Legal business name');
      await userEvent.type(name, 'Acme Inc.');

      const tin = screen.getByLabelText('Taxpayer Identification Number (TIN)');
      await userEvent.type(tin, '129876543');

      const phoneNumber = screen.getByLabelText('Phone number');
      await userEvent.type(phoneNumber, '5591542244'); // Phone from Mexico

      const website = screen.getByLabelText('Website');
      await userEvent.type(website, 'https://acme.com');

      const continueButton = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText('Phone number is invalid')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(0);
      });
    });
  });
});
