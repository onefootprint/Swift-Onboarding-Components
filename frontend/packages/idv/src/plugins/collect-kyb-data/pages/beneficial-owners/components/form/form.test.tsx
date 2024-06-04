import '../../../../../../config/initializers/i18next-test';

import {
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import { BeneficialOwnerDataAttribute } from '@onefootprint/types';
import React from 'react';

import type { FormProps } from './form';
import Form from './form';

describe('<Form />', () => {
  const renderForm = ({
    defaultValues,
    isLoading = false,
    onSubmit = () => {},
    ctaLabel,
    requireMultiKyc,
  }: Partial<FormProps>) => {
    customRender(
      <Form
        defaultValues={defaultValues}
        isLoading={isLoading}
        onSubmit={onSubmit}
        ctaLabel={ctaLabel}
        requireMultiKyc={requireMultiKyc}
      />,
    );
  };

  it('renders custom cta label', async () => {
    const onSubmit = jest.fn();
    renderForm({ onSubmit, ctaLabel: 'Custom CTA' });
    const ctaButton = screen.getByRole('button', { name: 'Custom CTA' });
    expect(ctaButton).toBeInTheDocument();
  });

  describe('when it has default values', () => {
    it('renders default values', async () => {
      const onSubmit = jest.fn();
      renderForm({
        onSubmit,
        defaultValues: [
          {
            [BeneficialOwnerDataAttribute.firstName]: 'John',
            [BeneficialOwnerDataAttribute.lastName]: 'Doe',
            [BeneficialOwnerDataAttribute.ownershipStake]: 50,
            [BeneficialOwnerDataAttribute.email]: undefined,
            [BeneficialOwnerDataAttribute.phoneNumber]: undefined,
          },
          {
            [BeneficialOwnerDataAttribute.firstName]: 'Lily',
            [BeneficialOwnerDataAttribute.lastName]: 'Doey',
            [BeneficialOwnerDataAttribute.ownershipStake]: 25,
            [BeneficialOwnerDataAttribute.email]: 'Lily@doey.com',
            [BeneficialOwnerDataAttribute.phoneNumber]: '+1 (555) 555-0100',
          },
        ],
        requireMultiKyc: true,
      });

      const firstNameFields = screen.getAllByLabelText('First name');
      expect(firstNameFields).toHaveLength(2);
      expect(firstNameFields[0]).toHaveValue('John');
      expect(firstNameFields[1]).toHaveValue('Lily');

      const lastNameFields = screen.getAllByLabelText('Last name');
      expect(lastNameFields).toHaveLength(2);
      expect(lastNameFields[0]).toHaveValue('Doe');
      expect(lastNameFields[1]).toHaveValue('Doey');

      const ownershipStakeFields = screen.getAllByLabelText(
        'Approximate ownership stake (%)',
      );
      expect(ownershipStakeFields).toHaveLength(2);
      expect(ownershipStakeFields[0]).toHaveValue(50);
      expect(ownershipStakeFields[1]).toHaveValue(25);

      const emailFields = screen.getAllByLabelText('Email');
      expect(emailFields).toHaveLength(1);
      expect(emailFields[0]).toHaveValue('Lily@doey.com');

      const phoneFields = screen.getAllByLabelText('Phone number');
      expect(phoneFields).toHaveLength(1);
      expect(phoneFields[0]).toHaveValue('(555) 555-0100');
    });
  });

  it('can add/remove beneficial owners', async () => {
    const onSubmit = jest.fn();
    renderForm({ onSubmit, requireMultiKyc: true });

    const title = screen.getByText('Beneficial owner (You)');
    expect(title).toBeInTheDocument();

    const addMoreButton = screen.getByRole('button', { name: 'Add more' });
    expect(addMoreButton).toBeInTheDocument();
    await userEvent.click(addMoreButton);

    const firstNameFields = screen.getAllByLabelText('First name');
    expect(firstNameFields).toHaveLength(2);
    await userEvent.type(firstNameFields[0], 'John');
    await userEvent.type(firstNameFields[1], 'Lily');

    const middleNameFields = screen.getAllByLabelText('Middle name (optional)');
    expect(middleNameFields).toHaveLength(2);
    await userEvent.type(middleNameFields[0], 'Middle');

    const lastNameFields = screen.getAllByLabelText('Last name');
    expect(lastNameFields).toHaveLength(2);
    await userEvent.type(lastNameFields[0], 'Doe');
    await userEvent.type(lastNameFields[1], 'Smith');

    const emailFields = screen.getAllByLabelText('Email');
    expect(
      screen.getByPlaceholderText('jane.doe@acme.com'),
    ).toBeInTheDocument();
    expect(emailFields).toHaveLength(1);
    await userEvent.type(emailFields[0], 'Lily@smith.com');

    const phoneFields = screen.getAllByLabelText('Phone number');
    expect(screen.getByPlaceholderText('(123) 456-7890')).toBeInTheDocument();
    expect(phoneFields).toHaveLength(1);
    await userEvent.type(phoneFields[0], '5555550100');

    const ownershipStakeFields = screen.getAllByLabelText(
      'Approximate ownership stake (%)',
    );
    expect(ownershipStakeFields).toHaveLength(2);
    await userEvent.type(ownershipStakeFields[0], '50');
    await userEvent.type(ownershipStakeFields[1], '50');

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeInTheDocument();
    await userEvent.click(continueButton);
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith([
        {
          [BeneficialOwnerDataAttribute.firstName]: 'John',
          [BeneficialOwnerDataAttribute.middleName]: 'Middle',
          [BeneficialOwnerDataAttribute.lastName]: 'Doe',
          [BeneficialOwnerDataAttribute.ownershipStake]: 50,
          [BeneficialOwnerDataAttribute.email]: undefined,
          [BeneficialOwnerDataAttribute.phoneNumber]: undefined,
        },
        {
          [BeneficialOwnerDataAttribute.firstName]: 'Lily',
          [BeneficialOwnerDataAttribute.middleName]: undefined,
          [BeneficialOwnerDataAttribute.lastName]: 'Smith',
          [BeneficialOwnerDataAttribute.ownershipStake]: 50,
          [BeneficialOwnerDataAttribute.email]: 'Lily@smith.com',
          [BeneficialOwnerDataAttribute.phoneNumber]: '+1 (555) 555-0100',
        },
      ]);
    });

    const removeButton = screen.getByRole('button', { name: 'Remove' });
    expect(removeButton).toBeInTheDocument();
    await userEvent.click(removeButton);

    const firstNameField = screen.getAllByLabelText('First name');
    expect(firstNameField).toHaveLength(1);
    expect(firstNameField[0]).toHaveValue('John');

    const middleNameField = screen.getAllByLabelText('Middle name (optional)');
    expect(middleNameField).toHaveLength(1);
    expect(middleNameField[0]).toHaveValue('Middle');

    const lastNameField = screen.getAllByLabelText('Last name');
    expect(lastNameField).toHaveLength(1);
    expect(lastNameField[0]).toHaveValue('Doe');

    const ownershipStakeField = screen.getAllByLabelText(
      'Approximate ownership stake (%)',
    );
    expect(ownershipStakeField).toHaveLength(1);
    expect(ownershipStakeField[0]).toHaveValue(50);

    await userEvent.click(continueButton);
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith([
        {
          [BeneficialOwnerDataAttribute.firstName]: 'John',
          [BeneficialOwnerDataAttribute.middleName]: 'Middle',
          [BeneficialOwnerDataAttribute.lastName]: 'Doe',
          [BeneficialOwnerDataAttribute.ownershipStake]: 50,
          [BeneficialOwnerDataAttribute.email]: undefined,
          [BeneficialOwnerDataAttribute.phoneNumber]: undefined,
        },
      ]);
    });
  });

  describe('when is a multi kyc flow', () => {
    it('shows show instructions about this flow', async () => {
      renderForm({ requireMultiKyc: true });

      const addMoreButton = screen.getByRole('button', { name: 'Add more' });
      expect(addMoreButton).toBeInTheDocument();
      await userEvent.click(addMoreButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            "We need to verify all other beneficial owners’ identities. We'll email them a link after you finish filling out your business verification.",
          ),
        ).toBeInTheDocument();
      });
    });
  });

  describe('when is not a multi kyc flow', () => {
    it("doesn't show email and phone fields for secondary BOs", async () => {
      renderForm({ requireMultiKyc: false });

      const addMoreButton = screen.getByRole('button', { name: 'Add more' });
      expect(addMoreButton).toBeInTheDocument();
      await userEvent.click(addMoreButton);

      const emailFields = screen.queryAllByLabelText('Email');
      expect(emailFields).toHaveLength(0);

      const phoneFields = screen.queryAllByLabelText('Phone number');
      expect(phoneFields).toHaveLength(0);
    });
  });

  describe('when submitting data with something wrong', () => {
    describe('when first/last name are not filled in correctly', () => {
      it('should shown an error message', async () => {
        const onSubmit = jest.fn();
        renderForm({ onSubmit, requireMultiKyc: true });

        const continueButton = screen.getByRole('button', { name: 'Continue' });
        expect(continueButton).toBeInTheDocument();

        await userEvent.click(continueButton);
        expect(onSubmit).not.toHaveBeenCalled();

        await waitFor(() => {
          const error = screen.getByText(
            'First name cannot be empty or is invalid',
          );
          expect(error).toBeInTheDocument();
        });
        await waitFor(() => {
          const error = screen.getByText(
            'Last name cannot be empty or is invalid',
          );
          expect(error).toBeInTheDocument();
        });
      });
    });

    describe('when then email and phone number are not filled in correctly', () => {
      it('should show an error message', async () => {
        const onSubmit = jest.fn();
        renderForm({ onSubmit, requireMultiKyc: true });

        const addMoreButton = screen.getByRole('button', { name: 'Add more' });
        expect(addMoreButton).toBeInTheDocument();
        await userEvent.click(addMoreButton);

        const continueButton = screen.getByRole('button', { name: 'Continue' });
        expect(continueButton).toBeInTheDocument();
        await userEvent.click(continueButton);

        // Check for email and phone error messages
        await waitFor(() => {
          expect(screen.getByText('Email is required')).toBeInTheDocument();
        });

        await waitFor(() => {
          expect(
            screen.getByText('Phone number is required'),
          ).toBeInTheDocument();
        });
      });
    });

    describe('when the sum of ownership stakes is less than 25%', () => {
      it('should show an error message', async () => {
        const onSubmit = jest.fn();
        renderForm({ onSubmit, requireMultiKyc: true });

        const continueButton = screen.getByRole('button', { name: 'Continue' });
        await userEvent.click(continueButton);

        const ownershipStakeField = screen.getByLabelText(
          'Approximate ownership stake (%)',
        );
        await userEvent.type(ownershipStakeField, '0');
        expect(
          screen.getByText('Ownership stake cannot be smaller than 1%'),
        ).toBeInTheDocument();
      });
    });

    describe('when sum of ownership stakes is over 100%', () => {
      it('should show a toast with the error', async () => {
        const onSubmit = jest.fn();
        renderForm({ onSubmit, requireMultiKyc: true });

        const addMoreButton = screen.getByRole('button', { name: 'Add more' });
        await userEvent.click(addMoreButton);

        const firstNameFields = screen.getAllByLabelText('First name');
        await userEvent.type(firstNameFields[0], 'John');
        await userEvent.type(firstNameFields[1], 'Lily');

        const lastNameFields = screen.getAllByLabelText('Last name');
        await userEvent.type(lastNameFields[0], 'Doe');
        await userEvent.type(lastNameFields[1], 'Smith');

        const emailFields = screen.getAllByLabelText('Email');
        await userEvent.type(emailFields[0], 'Lily@smith.com');

        const ownershipStakeFields = screen.getAllByLabelText(
          'Approximate ownership stake (%)',
        );
        await userEvent.type(ownershipStakeFields[0], '70');
        await userEvent.type(ownershipStakeFields[1], '70');

        const phoneFields = screen.getAllByLabelText('Phone number');
        await userEvent.type(phoneFields[0], '(555) 555-0100');

        const continueButton = screen.getByRole('button', { name: 'Continue' });
        await userEvent.click(continueButton);
        expect(onSubmit).not.toHaveBeenCalled();

        await waitFor(() => {
          const error = screen.getByText('Ownership stake total exceeds 100%');
          expect(error).toBeInTheDocument();
        });
      });
    });
  });

  describe('when submitting data correctly', () => {
    describe('when submitting one beneficial owner info', () => {
      it('should call onSubmit', async () => {
        const onSubmit = jest.fn();
        renderForm({ onSubmit, requireMultiKyc: true });

        const firstName = screen.getByLabelText('First name');
        await userEvent.type(firstName, 'John');

        const lastName = screen.getByLabelText('Last name');
        await userEvent.type(lastName, 'Doe');

        const ownershipStake = screen.getByLabelText(
          'Approximate ownership stake (%)',
        );
        await userEvent.type(ownershipStake, '50');

        const continueButton = screen.getByRole('button', { name: 'Continue' });
        await userEvent.click(continueButton);
        await waitFor(() => {
          expect(onSubmit).toHaveBeenCalledWith([
            {
              [BeneficialOwnerDataAttribute.firstName]: 'John',
              [BeneficialOwnerDataAttribute.middleName]: undefined,
              [BeneficialOwnerDataAttribute.lastName]: 'Doe',
              [BeneficialOwnerDataAttribute.ownershipStake]: 50,
              [BeneficialOwnerDataAttribute.email]: undefined,
              [BeneficialOwnerDataAttribute.phoneNumber]: undefined,
            },
          ]);
        });
      });
    });
  });
});
