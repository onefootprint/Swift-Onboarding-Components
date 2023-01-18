import {
  createUseRouterSpy,
  customRender,
  screen,
  userEvent,
  waitFor,
  within,
} from '@onefootprint/test-utils';
import {
  IdDocType,
  OnboardingStatus,
  UserDataAttribute,
} from '@onefootprint/types';
import React from 'react';
import { User, UserVaultData } from 'src/pages/users/users.types';

import { withRiskSignals } from './vault-data-content.test.config';
import VaultDataContentTestWrapper, {
  VaultDataTestWrapperProps,
} from './vault-data-content-test-wrapper';

const useRouterSpy = createUseRouterSpy();

describe('<VaultDataContent />', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname: '/users/detail',
      query: {
        footprint_user_id: 'fp_id_yCZehsWNeywHnk5JqL20u',
      },
    });
  });

  const getUser = (
    identityDataAttributes: UserDataAttribute[],
    identityDocumentTypes: IdDocType[],
  ): User => ({
    id: 'id',
    isPortable: false,
    identityDataAttributes,
    startTimestamp: 'time',
    orderingId: 'ordering',
    identityDocumentTypes,
    requiresManualReview: false,
    status: OnboardingStatus.verified,
  });

  const renderVaultDataContent = ({
    user,
    vaultData,
    isDecrypting,
    onSubmit,
  }: VaultDataTestWrapperProps) =>
    customRender(
      <VaultDataContentTestWrapper
        user={user}
        vaultData={vaultData}
        isDecrypting={isDecrypting}
        onSubmit={onSubmit}
      />,
    );

  describe('when viewing', () => {
    beforeAll(() => {
      withRiskSignals();
    });

    it('should show correct sections & rows with decrypted data', async () => {
      const onSubmit = jest.fn();
      const user = getUser(
        [
          UserDataAttribute.firstName,
          UserDataAttribute.lastName,
          UserDataAttribute.email,
          UserDataAttribute.city,
          UserDataAttribute.ssn4,
        ],
        [IdDocType.passport, IdDocType.driversLicense],
      );
      const vaultData: UserVaultData = {
        kycData: {
          [UserDataAttribute.firstName]: 'Piip',
          [UserDataAttribute.lastName]: 'Footprint',
          [UserDataAttribute.email]: null,
          [UserDataAttribute.city]: 'Istanbul',
          [UserDataAttribute.ssn4]: null,
        },
        idDoc: {
          [IdDocType.passport]: [{ front: 'image' }],
          [IdDocType.driversLicense]: null,
        },
      };

      renderVaultDataContent({
        user,
        vaultData,
        isDecrypting: false,
        onSubmit,
      });

      const basicSection = screen.getByTestId('basic-section');
      expect(basicSection).toBeInTheDocument();
      expect(within(basicSection).getByText('Basic data')).toBeInTheDocument();

      expect(within(basicSection).getByText('Full name')).toBeInTheDocument();
      expect(
        within(basicSection).getByText('Piip Footprint'),
      ).toBeInTheDocument();

      expect(within(basicSection).getByText('Email')).toBeInTheDocument();
      expect(within(basicSection).getByText('•••••••••')).toBeInTheDocument();

      const addressSection = screen.getByTestId('address-section');
      expect(addressSection).toBeInTheDocument();
      expect(
        within(addressSection).getByText('Address data'),
      ).toBeInTheDocument();

      expect(within(addressSection).getByText('City')).toBeInTheDocument();
      expect(within(addressSection).getByText('Istanbul')).toBeInTheDocument();

      const identitySection = screen.getByTestId('identity-section');
      expect(identitySection).toBeInTheDocument();
      expect(
        within(identitySection).getByText('Identity data'),
      ).toBeInTheDocument();

      expect(
        within(identitySection).getByText('SSN (Last 4)'),
      ).toBeInTheDocument();
      expect(
        within(identitySection).getByText('•••••••••'),
      ).toBeInTheDocument();

      const documentSection = screen.getByTestId('document-section');
      expect(documentSection).toBeInTheDocument();

      expect(within(documentSection).getByText('Passport')).toBeInTheDocument();
      expect(within(documentSection).getByText('Show')).toBeInTheDocument();

      expect(
        within(documentSection).getByText("Driver's License"),
      ).toBeInTheDocument();
      expect(
        within(documentSection).getByText('•••••••••'),
      ).toBeInTheDocument();
    });
  });

  describe('when decrypting', () => {
    beforeAll(() => {
      withRiskSignals();
    });

    it('should show correct sections & rows', async () => {
      const onSubmit = jest.fn();
      const user = getUser(
        [
          UserDataAttribute.firstName,
          UserDataAttribute.lastName,
          UserDataAttribute.email,
          UserDataAttribute.city,
          UserDataAttribute.ssn4,
        ],
        [IdDocType.passport, IdDocType.driversLicense],
      );
      const vaultData: UserVaultData = {
        kycData: {
          [UserDataAttribute.firstName]: 'Piip',
          [UserDataAttribute.lastName]: 'Footprint',
          [UserDataAttribute.email]: null,
          [UserDataAttribute.city]: 'Istanbul',
          [UserDataAttribute.ssn4]: null,
        },
        idDoc: {
          [IdDocType.passport]: [{ front: 'image' }],
          [IdDocType.driversLicense]: null,
        },
      };

      renderVaultDataContent({
        user,
        vaultData,
        isDecrypting: true,
        onSubmit,
      });

      const basicSection = screen.getByTestId('basic-section');
      expect(basicSection).toBeInTheDocument();
      expect(within(basicSection).getByText('Basic data')).toBeInTheDocument();

      const nameCheckbox = within(basicSection).getByLabelText(
        'Full name',
      ) as HTMLInputElement;
      expect(nameCheckbox).toBeInTheDocument();
      expect(nameCheckbox.disabled).toBe(true);
      expect(nameCheckbox.checked).toBe(true);
      expect(
        within(basicSection).getByText('Piip Footprint'),
      ).toBeInTheDocument();

      const emailCheckbox = within(basicSection).getByLabelText(
        'Email',
      ) as HTMLInputElement;
      expect(emailCheckbox).toBeInTheDocument();
      expect(emailCheckbox.disabled).toBe(false);
      expect(emailCheckbox.checked).toBe(false);
      expect(within(basicSection).getByText('•••••••••')).toBeInTheDocument();
      await userEvent.click(emailCheckbox);
      await waitFor(() => {
        expect(emailCheckbox.checked).toBe(true);
      });

      const addressSection = screen.getByTestId('address-section');
      expect(addressSection).toBeInTheDocument();
      expect(
        within(addressSection).getByText('Address data'),
      ).toBeInTheDocument();

      const cityCheckbox = within(addressSection).getByLabelText(
        'City',
      ) as HTMLInputElement;
      expect(cityCheckbox).toBeInTheDocument();
      expect(cityCheckbox.disabled).toBe(true);
      expect(cityCheckbox.checked).toBe(true);
      expect(within(addressSection).getByText('Istanbul')).toBeInTheDocument();

      const identitySection = screen.getByTestId('identity-section');
      expect(identitySection).toBeInTheDocument();
      expect(
        within(identitySection).getByText('Identity data'),
      ).toBeInTheDocument();

      const ssnCheckbox = within(identitySection).getByLabelText(
        'SSN (Last 4)',
      ) as HTMLInputElement;
      expect(ssnCheckbox).toBeInTheDocument();
      expect(ssnCheckbox.disabled).toBe(false);
      expect(ssnCheckbox.checked).toBe(false);
      expect(
        within(identitySection).getByText('•••••••••'),
      ).toBeInTheDocument();
      await userEvent.click(ssnCheckbox);
      await waitFor(() => {
        expect(ssnCheckbox.checked).toBe(true);
      });
    });

    it('can toggle select/deselect all buttons', async () => {
      const onSubmit = jest.fn();
      const user = getUser(
        [
          UserDataAttribute.firstName,
          UserDataAttribute.lastName,
          UserDataAttribute.email,
        ],
        [],
      );
      const vaultData: UserVaultData = {
        kycData: {
          [UserDataAttribute.firstName]: null,
          [UserDataAttribute.lastName]: null,
          [UserDataAttribute.email]: null,
        },
        idDoc: {},
      };

      renderVaultDataContent({
        user,
        vaultData,
        isDecrypting: true,
        onSubmit,
      });

      const basicSection = screen.getByTestId('basic-section');
      expect(basicSection).toBeInTheDocument();
      expect(within(basicSection).getByText('Basic data')).toBeInTheDocument();

      const nameCheckbox = within(basicSection).getByLabelText(
        'Full name',
      ) as HTMLInputElement;
      expect(nameCheckbox).toBeInTheDocument();
      expect(nameCheckbox.checked).toBe(false);

      const emailCheckbox = within(basicSection).getByLabelText(
        'Email',
      ) as HTMLInputElement;
      expect(emailCheckbox).toBeInTheDocument();
      expect(emailCheckbox.checked).toBe(false);

      let button = within(basicSection).getByRole('button', {
        name: 'Select all',
      });
      expect(button).toBeInTheDocument();
      await userEvent.click(button);
      await waitFor(() => {
        expect(nameCheckbox.checked).toBe(true);
      });
      await waitFor(() => {
        expect(emailCheckbox.checked).toBe(true);
      });
      await waitFor(() => {
        expect(
          within(basicSection).getByRole('button', {
            name: 'Deselect all',
          }),
        ).toBeInTheDocument();
      });

      button = within(basicSection).getByRole('button', {
        name: 'Deselect all',
      });
      await userEvent.click(button);
      await waitFor(() => {
        expect(nameCheckbox.checked).toBe(false);
      });
      await waitFor(() => {
        expect(emailCheckbox.checked).toBe(false);
      });
      await waitFor(() => {
        expect(
          within(basicSection).getByRole('button', {
            name: 'Select all',
          }),
        ).toBeInTheDocument();
      });
    });
  });
});
