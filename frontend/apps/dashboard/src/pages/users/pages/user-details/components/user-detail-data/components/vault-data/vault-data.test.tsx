import {
  createUseRouterSpy,
  customRender,
  screen,
  userEvent,
  waitFor,
  within,
} from '@onefootprint/test-utils';
import { RoleScope } from '@onefootprint/types';
import React from 'react';
import {
  asAdminUser,
  asMemberUser,
  asUserWithScope,
  resetUser,
} from 'src/config/tests';
import { USER_HEADER_ACTIONS_ID } from 'src/pages/users/pages/user-details/constants';

import VaultData from './vault-data';
import {
  getTextByRow,
  selectDecryptReasonAndContinue,
  withRiskSignals,
  withUser,
  withUserDecrypt,
} from './vault-data.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<VaultDataContent />', () => {
  const userId = 'fp_id_yCZehsWNeywHnk5JqL20u';

  beforeEach(() => {
    asAdminUser();
    withUser(userId);
    withRiskSignals(userId);
    useRouterSpy({
      pathname: '/users/detail',
      query: {
        footprint_user_id: userId,
      },
    });
  });

  afterAll(() => {
    resetUser();
  });

  const renderVaultDataAndWaitData = async () => {
    customRender(
      <>
        <div id={USER_HEADER_ACTIONS_ID} />
        <VaultData />
      </>,
    );

    await waitFor(() => {
      expect(screen.getByText('Basic data')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Decrypt data' }),
      ).toBeInTheDocument();
    });
  };

  describe('when the user has filled all the information, except the address line 2', () => {
    describe('basic data', () => {
      it('should display the encrypted data', async () => {
        await renderVaultDataAndWaitData();

        const nameRow = screen.getByRole('row', { name: 'Full name' });
        const nameValue = within(nameRow).getByText('•••••••••');
        expect(nameValue).toBeInTheDocument();

        const emailRow = screen.getByRole('row', { name: 'Email' });
        const emailValue = within(emailRow).getByText('•••••••••');
        expect(emailValue).toBeInTheDocument();

        const phoneNumber = screen.getByRole('row', { name: 'Phone number' });
        const phoneValue = within(phoneNumber).getByText('•••••••••');
        expect(phoneValue).toBeInTheDocument();
      });

      describe('when clicking on the decrypt button', () => {
        it('should allow to decrypt the basic data', async () => {
          withUserDecrypt(userId, {
            'id.last_name': 'Doe',
            'id.phone_number': '+14259334138',
            'id.first_name': 'Jane',
            'id.email': 'jane.doe@acme.com',
          });
          await renderVaultDataAndWaitData();

          const decryptButton = screen.getByRole('button', {
            name: 'Decrypt data',
          });
          await userEvent.click(decryptButton);

          const fullNameField = screen.getByRole('checkbox', {
            name: 'Full name',
          });
          await userEvent.click(fullNameField);

          const emailField = screen.getByRole('checkbox', { name: 'Email' });
          await userEvent.click(emailField);

          const phoneNumberField = screen.getByRole('checkbox', {
            name: 'Phone number',
          });
          await userEvent.click(phoneNumberField);

          const continueButton = screen.getByRole('button', {
            name: 'Continue',
          });
          await userEvent.click(continueButton);

          await selectDecryptReasonAndContinue();

          await waitFor(() => {
            const name = getTextByRow('Full name', 'Jane Doe');
            expect(name).toBeInTheDocument();
          });

          await waitFor(() => {
            const email = getTextByRow('Email', 'jane.doe@acme.com');
            expect(email).toBeInTheDocument();
          });

          await waitFor(() => {
            const phone = getTextByRow('Phone number', '+14259334138');
            expect(phone).toBeInTheDocument();
          });
        });
      });
    });

    describe('identity data', () => {
      it('should display the encrypted data', async () => {
        await renderVaultDataAndWaitData();

        const ssn = getTextByRow('SSN (Full)', '•••••••••');
        expect(ssn).toBeInTheDocument();

        const ssn4 = getTextByRow('SSN (Last 4)', '•••••••••');
        expect(ssn4).toBeInTheDocument();

        const dob = getTextByRow('Date of Birth', '•••••••••');
        expect(dob).toBeInTheDocument();
      });

      describe('when clicking on the decrypt button', () => {
        it('should display the encrypted data', async () => {
          withUserDecrypt(userId, {
            'id.ssn9': '234324324',
            'id.ssn4': '4324',
            'id.dob': '1990-01-04',
          });
          await renderVaultDataAndWaitData();

          const decryptButton = screen.getByRole('button', {
            name: 'Decrypt data',
          });
          await userEvent.click(decryptButton);

          const ssnField = screen.getByRole('checkbox', {
            name: 'SSN (Full)',
          });
          await userEvent.click(ssnField);

          const ssn4Field = screen.getByRole('checkbox', {
            name: 'SSN (Last 4)',
          });
          await userEvent.click(ssn4Field);

          const dobField = screen.getByRole('checkbox', {
            name: 'Date of Birth',
          });
          await userEvent.click(dobField);

          const continueButton = screen.getByRole('button', {
            name: 'Continue',
          });
          await userEvent.click(continueButton);

          await selectDecryptReasonAndContinue();

          await waitFor(() => {
            const ssn = getTextByRow('SSN (Full)', '234324324');
            expect(ssn).toBeInTheDocument();
          });

          await waitFor(() => {
            const ssn4 = getTextByRow('SSN (Last 4)', '4324');
            expect(ssn4).toBeInTheDocument();
          });

          await waitFor(() => {
            const dob = getTextByRow('Date of Birth', '1990-01-04');
            expect(dob).toBeInTheDocument();
          });
        });
      });
    });

    describe('address data', () => {
      it('should display the encrypted data', async () => {
        await renderVaultDataAndWaitData();

        const addressLine1 = getTextByRow('Address line 1', '•••••••••');
        expect(addressLine1).toBeInTheDocument();

        const addressLine2 = getTextByRow('Address line 2', '-');
        expect(addressLine2).toBeInTheDocument();

        const city = getTextByRow('City', '•••••••••');
        expect(city).toBeInTheDocument();

        const state = getTextByRow('State', '•••••••••');
        expect(state).toBeInTheDocument();

        const zip = getTextByRow('Zip code', '•••••••••');
        expect(zip).toBeInTheDocument();

        const country = getTextByRow('Country', '•••••••••');
        expect(country).toBeInTheDocument();
      });

      describe('when clicking on the decrypt button', () => {
        it('should allow the data', async () => {
          withUserDecrypt(userId, {
            'id.address_line1': '14 Linda Street',
            'id.zip': '90200',
            'id.city': 'San Francisco',
            'id.state': 'CA',
            'id.country': 'US',
          });
          await renderVaultDataAndWaitData();

          const decryptButton = screen.getByRole('button', {
            name: 'Decrypt data',
          });
          await userEvent.click(decryptButton);

          const addressLine1Field = screen.getByRole('checkbox', {
            name: 'Address line 1',
          });
          await userEvent.click(addressLine1Field);

          const addressLine2Field = screen.getByRole('checkbox', {
            name: 'Address line 2',
          });
          expect(addressLine2Field).toBeDisabled();

          const cityField = screen.getByRole('checkbox', {
            name: 'City',
          });
          await userEvent.click(cityField);

          const stateField = screen.getByRole('checkbox', {
            name: 'State',
          });
          await userEvent.click(stateField);

          const countryField = screen.getByRole('checkbox', {
            name: 'Country',
          });
          await userEvent.click(countryField);

          const continueButton = screen.getByRole('button', {
            name: 'Continue',
          });
          await userEvent.click(continueButton);

          await selectDecryptReasonAndContinue();

          await waitFor(() => {
            const addressLine1 = getTextByRow(
              'Address line 1',
              '14 Linda Street',
            );
            expect(addressLine1).toBeInTheDocument();
          });

          await waitFor(() => {
            const city = getTextByRow('City', 'San Francisco');
            expect(city).toBeInTheDocument();
          });

          await waitFor(() => {
            const state = getTextByRow('State', 'CA');
            expect(state).toBeInTheDocument();
          });

          await waitFor(() => {
            const country = getTextByRow('Country', 'US');
            expect(country).toBeInTheDocument();
          });
        });
      });
    });

    describe('investor profile data', () => {
      it('should display the encrypted data', async () => {
        await renderVaultDataAndWaitData();

        const occupation = getTextByRow('Occupation', '•••••••••');
        expect(occupation).toBeInTheDocument();

        const annualIncome = getTextByRow('Annual income', '•••••••••');
        expect(annualIncome).toBeInTheDocument();

        const netWorth = getTextByRow('Net worth', '•••••••••');
        expect(netWorth).toBeInTheDocument();

        const investmentGoals = getTextByRow('Investment goals', '•••••••••');
        expect(investmentGoals).toBeInTheDocument();

        const riskTolerance = getTextByRow('Risk tolerance', '•••••••••');
        expect(riskTolerance).toBeInTheDocument();

        const declarations = getTextByRow('Declaration(s)', '•••••••••');
        expect(declarations).toBeInTheDocument();

        // const complianceLetter = getTextByRow('Compliance letter', '•••••••••');
        // expect(complianceLetter).toBeInTheDocument();
      });
    });
  });

  describe("when the user doesn't have permissions to decrypt any fields", () => {
    beforeEach(() => {
      asMemberUser();
    });

    it('should disable the decrypt button', async () => {
      await renderVaultDataAndWaitData();

      const decryptButton = screen.getByRole('button', {
        name: 'Decrypt data',
      });
      expect(decryptButton).toBeDisabled();
    });
  });

  describe('when the user has permission to decrypt only one field', () => {
    beforeEach(() => {
      asUserWithScope([RoleScope.decryptEmail]);
    });

    it('should disable the fields without permission', async () => {
      await renderVaultDataAndWaitData();

      const decryptButton = screen.getByRole('button', {
        name: 'Decrypt data',
      });
      await userEvent.click(decryptButton);

      const fullNameField = screen.getByRole('checkbox', {
        name: 'Full name',
      });
      expect(fullNameField).toBeDisabled();

      await userEvent.hover(fullNameField);
      const tooltip = screen.getByRole('tooltip', {
        name: "You're not allowed to decrypt data",
      });
      expect(tooltip).toBeInTheDocument();
    });
  });
});
