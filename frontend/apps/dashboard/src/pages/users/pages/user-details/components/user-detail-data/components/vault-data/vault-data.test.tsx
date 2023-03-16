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

import DecryptMachineProvider from '../../../decrypt-machine-provider';
import VaultData from './vault-data';
import {
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
      <DecryptMachineProvider>
        <div id={USER_HEADER_ACTIONS_ID} />
        <VaultData />
      </DecryptMachineProvider>,
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
            const nameRow = screen.getByRole('row', { name: 'Full name' });
            const nameValue = within(nameRow).getByText('Jane Doe');
            expect(nameValue).toBeInTheDocument();
          });

          await waitFor(() => {
            const emailRow = screen.getByRole('row', { name: 'Email' });
            const emailValue = within(emailRow).getByText('jane.doe@acme.com');
            expect(emailValue).toBeInTheDocument();
          });

          await waitFor(() => {
            const phoneRow = screen.getByRole('row', { name: 'Phone number' });
            const phoneValue = within(phoneRow).getByText('+14259334138');
            expect(phoneValue).toBeInTheDocument();
          });
        });
      });
    });

    describe('identity data', () => {
      it('should display the encrypted data', async () => {
        await renderVaultDataAndWaitData();

        const ssnRow = screen.getByRole('row', { name: 'SSN (Full)' });
        const ssnValue = within(ssnRow).getByText('•••••••••');
        expect(ssnValue).toBeInTheDocument();

        const ssn4Row = screen.getByRole('row', { name: 'SSN (Last 4)' });
        const ssn4Value = within(ssn4Row).getByText('•••••••••');
        expect(ssn4Value).toBeInTheDocument();

        const dobRow = screen.getByRole('row', { name: 'Date of Birth' });
        const dobValue = within(dobRow).getByText('•••••••••');
        expect(dobValue).toBeInTheDocument();
      });

      describe('when clicking on the decrypt button', () => {
        it('should allow to decrypt the basic data', async () => {
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
            const ssnRow = screen.getByRole('row', { name: 'SSN (Full)' });
            const ssnValue = within(ssnRow).getByText('234324324');
            expect(ssnValue).toBeInTheDocument();
          });

          await waitFor(() => {
            const ssn4Row = screen.getByRole('row', { name: 'SSN (Last 4)' });
            const ssn4Value = within(ssn4Row).getByText('4324');
            expect(ssn4Value).toBeInTheDocument();
          });

          await waitFor(() => {
            const dobRow = screen.getByRole('row', { name: 'Date of Birth' });
            const dobValue = within(dobRow).getByText('1990-01-04');
            expect(dobValue).toBeInTheDocument();
          });
        });
      });
    });

    describe('address data', () => {
      it('should display the encrypted data', async () => {
        await renderVaultDataAndWaitData();

        const addressLine1Row = screen.getByRole('row', {
          name: 'Address line 1',
        });
        const addressLine1Value =
          within(addressLine1Row).getByText('•••••••••');
        expect(addressLine1Value).toBeInTheDocument();

        const addressLine2Row = screen.getByRole('row', {
          name: 'Address line 2',
        });
        const addressLine2Value = within(addressLine2Row).getByText('-');
        expect(addressLine2Value).toBeInTheDocument();

        const cityRow = screen.getByRole('row', { name: 'City' });
        const cityValue = within(cityRow).getByText('•••••••••');
        expect(cityValue).toBeInTheDocument();

        const stateRow = screen.getByRole('row', { name: 'State' });
        const stateValue = within(stateRow).getByText('•••••••••');
        expect(stateValue).toBeInTheDocument();

        const zipRow = screen.getByRole('row', { name: 'Zip code' });
        const zipValue = within(zipRow).getByText('•••••••••');
        expect(within(zipValue).getByText('•••••••••')).toBeInTheDocument();

        const countryRow = screen.getByRole('row', { name: 'Country' });
        const countryValue = within(countryRow).getByText('•••••••••');
        expect(countryValue).toBeInTheDocument();
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
            const addressLineRow = screen.getByRole('row', {
              name: 'Address line 1',
            });
            const addressLineValue =
              within(addressLineRow).getByText('14 Linda Street');
            expect(addressLineValue).toBeInTheDocument();
          });

          await waitFor(() => {
            const cityRow = screen.getByRole('row', { name: 'City' });
            const cityValue = within(cityRow).getByText('San Francisco');
            expect(cityValue).toBeInTheDocument();
          });

          await waitFor(() => {
            const stateRow = screen.getByRole('row', { name: 'State' });
            const stateValue = within(stateRow).getByText('CA');
            expect(stateValue).toBeInTheDocument();
          });

          await waitFor(() => {
            const countryRow = screen.getByRole('row', { name: 'Country' });
            const contryValue = within(countryRow).getByText('US');
            expect(contryValue).toBeInTheDocument();
          });
        });
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
