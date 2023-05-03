import {
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import { BeneficialOwnerDataAttribute, BusinessDI } from '@onefootprint/types';
import React from 'react';

import Form, { FormProps } from './form';

// TODO: uncomment skipped tests when PhoneInput issues are fixed

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

  it('onsubmit gets called when submitting one beneficial owner info', async () => {
    const onSubmit = jest.fn();
    renderForm({ onSubmit });

    const firstName = screen.getByLabelText('First name');
    expect(firstName).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Jane')).toBeInTheDocument();
    await userEvent.type(firstName, 'John');

    const lastName = screen.getByLabelText('Last name');
    expect(lastName).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Doe')).toBeInTheDocument();
    await userEvent.type(lastName, 'Doe');

    const ownershipStake = screen.getByLabelText('Ownership stake (%)');
    expect(ownershipStake).toBeInTheDocument();
    expect(screen.getByPlaceholderText('25')).toBeInTheDocument();
    await userEvent.type(ownershipStake, '50');

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeInTheDocument();
    await userEvent.click(continueButton);
    await waitFor(() => {
      expect(onSubmit).toBeCalledWith({
        [BusinessDI.beneficialOwners]: [
          {
            [BeneficialOwnerDataAttribute.firstName]: 'John',
            [BeneficialOwnerDataAttribute.lastName]: 'Doe',
            [BeneficialOwnerDataAttribute.ownershipStake]: 50,
            [BeneficialOwnerDataAttribute.email]: undefined,
            [BeneficialOwnerDataAttribute.phoneNumber]: undefined,
          },
        ],
      });
    });
  });

  it.skip('can add/remove beneficial owners', async () => {
    const onSubmit = jest.fn();
    renderForm({ onSubmit });

    const title = screen.getByText('Beneficial owner (You)');
    expect(title).toBeInTheDocument();

    const addMoreButton = screen.getByRole('button', { name: 'Add more' });
    expect(addMoreButton).toBeInTheDocument();
    await userEvent.click(addMoreButton);

    const firstNameFields = screen.getAllByLabelText('First name');
    expect(firstNameFields).toHaveLength(2);
    await userEvent.type(firstNameFields[0], 'John');
    await userEvent.type(firstNameFields[1], 'Lily');

    const lastNameFields = screen.getAllByLabelText('Last name');
    expect(lastNameFields).toHaveLength(2);
    await userEvent.type(lastNameFields[0], 'Doe');
    await userEvent.type(lastNameFields[1], 'Smith');

    const emailFields = screen.getAllByLabelText('Email');
    expect(
      screen.getByPlaceholderText('your.email@email.com'),
    ).toBeInTheDocument();
    expect(emailFields).toHaveLength(1);
    await userEvent.type(emailFields[0], 'Lily@smith.com');

    const phoneFields = screen.getAllByLabelText('Phone number');
    expect(screen.getByPlaceholderText('(123) 456-7890')).toBeInTheDocument();
    expect(phoneFields).toHaveLength(1);
    await userEvent.type(phoneFields[0], '9999999999');

    const ownershipStakeFields = screen.getAllByLabelText(
      'Ownership stake (%)',
    );
    expect(ownershipStakeFields).toHaveLength(2);
    await userEvent.type(ownershipStakeFields[0], '50');
    await userEvent.type(ownershipStakeFields[1], '50');

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeInTheDocument();
    await userEvent.click(continueButton);
    await waitFor(() => {
      expect(onSubmit).toBeCalledWith({
        [BusinessDI.beneficialOwners]: [
          {
            [BeneficialOwnerDataAttribute.firstName]: 'John',
            [BeneficialOwnerDataAttribute.lastName]: 'Doe',
            [BeneficialOwnerDataAttribute.ownershipStake]: 50,
          },
          {
            [BeneficialOwnerDataAttribute.firstName]: 'Lily',
            [BeneficialOwnerDataAttribute.lastName]: 'Smith',
            [BeneficialOwnerDataAttribute.ownershipStake]: 50,
            [BeneficialOwnerDataAttribute.email]: 'Lily@smith.com',
            [BeneficialOwnerDataAttribute.phoneNumber]: '9999999999',
          },
        ],
      });
    });

    const removeButton = screen.getByRole('button', { name: 'Remove' });
    expect(removeButton).toBeInTheDocument();
    await userEvent.click(removeButton);

    const firstNameField = screen.getAllByLabelText('First name');
    expect(firstNameField).toHaveLength(1);
    expect(firstNameField[0]).toHaveValue('John');

    const lastNameField = screen.getAllByLabelText('Last name');
    expect(lastNameField).toHaveLength(1);
    expect(lastNameField[0]).toHaveValue('Doe');

    const ownershipStakeField = screen.getAllByLabelText('Ownership stake (%)');
    expect(ownershipStakeField).toHaveLength(1);
    expect(ownershipStakeField[0]).toHaveValue(50);

    await userEvent.click(continueButton);
    await waitFor(() => {
      expect(onSubmit).toBeCalledWith({
        [BusinessDI.beneficialOwners]: [
          {
            [BeneficialOwnerDataAttribute.firstName]: 'John',
            [BeneficialOwnerDataAttribute.lastName]: 'Doe',
            [BeneficialOwnerDataAttribute.ownershipStake]: 50,
          },
        ],
      });
    });
  });

  it.skip('shows multi kyc message', async () => {
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

  it('renders custom cta label', async () => {
    const onSubmit = jest.fn();
    renderForm({ onSubmit, ctaLabel: 'Custom CTA' });
    const ctaButton = screen.getByRole('button', { name: 'Custom CTA' });
    expect(ctaButton).toBeInTheDocument();
  });

  it.skip('renders default values', async () => {
    const onSubmit = jest.fn();
    renderForm({
      onSubmit,
      defaultValues: {
        beneficialOwners: [
          {
            [BeneficialOwnerDataAttribute.firstName]: 'John',
            [BeneficialOwnerDataAttribute.lastName]: 'Doe',
            [BeneficialOwnerDataAttribute.ownershipStake]: 50,
          },
          {
            [BeneficialOwnerDataAttribute.firstName]: 'Lily',
            [BeneficialOwnerDataAttribute.lastName]: 'Doey',
            [BeneficialOwnerDataAttribute.ownershipStake]: 25,
            [BeneficialOwnerDataAttribute.email]: 'Lily@doey.com',
            [BeneficialOwnerDataAttribute.phoneNumber]: '9999999999',
          },
        ],
      },
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
      'Ownership stake (%)',
    );
    expect(ownershipStakeFields).toHaveLength(2);
    expect(ownershipStakeFields[0]).toHaveValue(50);
    expect(ownershipStakeFields[1]).toHaveValue(25);

    const emailFields = screen.getAllByLabelText('Email');
    expect(emailFields).toHaveLength(1);
    expect(emailFields[0]).toHaveValue('Lily@doey.com');

    const phoneFields = screen.getAllByLabelText('Phone number');
    expect(phoneFields).toHaveLength(1);
    expect(phoneFields[0]).toHaveValue('9999999999');
  });

  it('renders error states', async () => {
    const onSubmit = jest.fn();
    renderForm({ onSubmit });

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeInTheDocument();
    await userEvent.click(continueButton);
    expect(onSubmit).not.toBeCalled();

    await waitFor(() => {
      expect(
        screen.getByText('First name cannot be empty or is invalid'),
      ).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(
        screen.getByText('Last name cannot be empty or is invalid'),
      ).toBeInTheDocument();
    });

    // Type value less than 25 into ownership stake
    const ownershipStakeField = screen.getByLabelText('Ownership stake (%)');
    await userEvent.type(ownershipStakeField, '20');
    expect(
      screen.getByText(
        'Only list individuals who own at least 25% of the business',
      ),
    ).toBeInTheDocument();

    await userEvent.clear(ownershipStakeField);
    await userEvent.click(continueButton);
    await waitFor(() => {
      expect(
        screen.getByText('Ownership stake cannot be empty or is invalid'),
      ).toBeInTheDocument();
    });

    // Type value larger than 100 into ownership stake
    await userEvent.type(ownershipStakeField, '101');
    expect(
      screen.getByText('Ownership stake cannot be larger than 100%'),
    ).toBeInTheDocument();
  });

  it.skip('checks for email and phone errors', async () => {
    const onSubmit = jest.fn();
    renderForm({ onSubmit });
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
      expect(screen.getByText('Phone number is required')).toBeInTheDocument();
    });
  });

  it.skip('shows error toast when sum of ownership stakes is over 100%', async () => {
    const onSubmit = jest.fn();
    renderForm({ onSubmit });

    const addMoreButton = screen.getByRole('button', { name: 'Add more' });
    expect(addMoreButton).toBeInTheDocument();
    await userEvent.click(addMoreButton);

    const firstNameFields = screen.getAllByLabelText('First name');
    expect(firstNameFields).toHaveLength(2);
    await userEvent.type(firstNameFields[0], 'John');
    await userEvent.type(firstNameFields[1], 'Lily');

    const lastNameFields = screen.getAllByLabelText('Last name');
    expect(lastNameFields).toHaveLength(2);
    await userEvent.type(lastNameFields[0], 'Doe');
    await userEvent.type(lastNameFields[1], 'Smith');

    const emailFields = screen.getAllByLabelText('Email');
    expect(
      screen.getByPlaceholderText('your.email@email.com'),
    ).toBeInTheDocument();
    expect(emailFields).toHaveLength(1);
    await userEvent.type(emailFields[0], 'Lily@smith.com');

    const ownershipStakeFields = screen.getAllByLabelText(
      'Ownership stake (%)',
    );
    expect(ownershipStakeFields).toHaveLength(2);
    await userEvent.type(ownershipStakeFields[0], '70');
    await userEvent.type(ownershipStakeFields[1], '70');

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeInTheDocument();
    await userEvent.click(continueButton);
    expect(onSubmit).not.toBeCalled();

    await waitFor(() => {
      expect(
        screen.getByText('Ownership stake total exceeds 100%'),
      ).toBeInTheDocument();
    });
  });
});
