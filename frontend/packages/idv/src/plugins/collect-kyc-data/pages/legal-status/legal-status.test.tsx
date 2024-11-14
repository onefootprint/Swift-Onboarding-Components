import { customRender, screen, selectEvents, userEvent, waitFor } from '@onefootprint/test-utils';
import type { CountryCode } from '@onefootprint/types';
import { ChallengeKind, IdDI, UsLegalStatus, VisaKind } from '@onefootprint/types';

import type { KycData } from '../../utils/data-types';
import type { InitMachineArgs } from '../../utils/state-machine/machine';
import TestWrapper from '../../utils/test-wrapper';
import {
  withIdentify,
  withIdentifyVerify,
  withLoginChallenge,
  withUserToken,
  withUserVault,
} from './index.test.config';
import LegalStatus from './legal-status';
import getInitialContext from './utils/test/get-initial-context';

const renderLegalStatus = (initialContext: InitMachineArgs, onComplete?: (args: KycData) => void) => {
  customRender(
    <TestWrapper initialContext={initialContext} initState="confirm">
      <LegalStatus onComplete={onComplete} />
    </TestWrapper>,
  );
};

describe('LegalStatus', () => {
  beforeEach(() => {
    withIdentify([ChallengeKind.biometric], true);
    withIdentifyVerify();
    withLoginChallenge(ChallengeKind.biometric);
    withUserToken([]);
    withUserVault();
  });

  const otherValues = {
    decrypted: false,
    scrubbed: false,
    bootstrap: false,
    dirty: false,
  };

  describe('when the page is initially shown', () => {
    it('only the three status fields and the country of birth field should be present', async () => {
      const initialContext = getInitialContext();
      renderLegalStatus(initialContext);

      const citizenRadio = screen.getByTestId('citizen-radio');
      expect(citizenRadio).toBeInTheDocument();

      const permanentResidentRadio = screen.getByTestId('permanent-resident-radio');
      expect(permanentResidentRadio).toBeInTheDocument();

      const visaRadio = screen.getByTestId('visa-radio');
      expect(visaRadio).toBeInTheDocument();

      const nationalitySelect = screen.getByTestId('nationality-select');
      expect(nationalitySelect).toBeInTheDocument();
    });

    it('the citizen status option and the US country of birth should be selected by default', async () => {
      const initialContext = getInitialContext();
      renderLegalStatus(initialContext);

      const citizenInput = screen.getByTestId('citizen-radio').querySelector('input') as HTMLInputElement;
      expect(citizenInput.checked).toBe(true);

      const usaText = screen.getByText('United States of America');
      expect(usaText).toBeInTheDocument();
    });

    it('any existing data should be filled by default', async () => {
      const data = {
        [IdDI.usLegalStatus]: {
          value: 'visa' as UsLegalStatus,
          ...otherValues,
        },
        [IdDI.nationality]: {
          value: 'HK' as CountryCode,
          ...otherValues,
        },
        [IdDI.visaKind]: {
          value: 'h1b' as VisaKind,
          ...otherValues,
        },
        [IdDI.visaExpirationDate]: {
          value: '01/01/2222',
          ...otherValues,
        },
      };
      const initialContext = getInitialContext({ data });
      renderLegalStatus(initialContext);

      const visaInput = screen.getByTestId('visa-radio').querySelector('input') as HTMLInputElement;
      expect(visaInput.checked).toBe(true);

      const nationalityText = screen.getByText('Hong Kong');
      expect(nationalityText).toBeInTheDocument();

      const visaKindText = screen.getByText('H-1B');
      expect(visaKindText).toBeInTheDocument();

      const visaExpirationInput = screen.getByTestId('visa-expiration-textinput');
      expect(visaExpirationInput).toHaveValue('01/01/2222');
    });
  });

  describe('when the citizen status option is selected', () => {
    it('no citizenship or visa fields should be present', async () => {
      const initialContext = getInitialContext();
      renderLegalStatus(initialContext);

      const citizenshipSelects = screen.queryAllByText('Citizenship');
      expect(citizenshipSelects).toHaveLength(0);

      const visaKindSelect = screen.queryByTestId('visa-kind-select');
      expect(visaKindSelect).not.toBeInTheDocument();

      const visaExpirationTextInput = screen.queryByTestId('visa-expiration-textinput');
      expect(visaExpirationTextInput).not.toBeInTheDocument();
    });

    it('should submit the default status and country of birth without any citizenship or visa fields', async () => {
      const onComplete = jest.fn();
      const initialContext = getInitialContext();
      renderLegalStatus(initialContext, onComplete);

      const continueButton = screen.getByTestId('kyc-legal-status-cta');
      expect(continueButton).toBeInTheDocument();

      await userEvent.click(continueButton);

      await waitFor(() => {
        const args = {
          [IdDI.usLegalStatus]: {
            value: UsLegalStatus.citizen,
            ...otherValues,
          },
          [IdDI.nationality]: {
            value: 'US',
            ...otherValues,
          },
          [IdDI.citizenships]: {
            value: undefined,
            ...otherValues,
          },
          [IdDI.visaExpirationDate]: {
            value: undefined,
            ...otherValues,
          },
          [IdDI.visaKind]: {
            value: undefined,
            ...otherValues,
          },
        };
        expect(onComplete).toHaveBeenCalledWith(args);
      });
    });

    it('after changing status options, any data filled out for the previous status options should not be submitted', async () => {
      const onComplete = jest.fn();
      const initialContext = getInitialContext();
      renderLegalStatus(initialContext, onComplete);

      const visaRadio = screen.getByTestId('visa-radio');
      await userEvent.click(visaRadio);

      const triggers = screen.getAllByRole('button', {
        name: 'Select',
      });
      expect(triggers).toHaveLength(3);

      const nationalityTrigger = triggers[0];
      await selectEvents.select(nationalityTrigger, 'Albania');
      const visaTypeTrigger = triggers[2];
      await selectEvents.select(visaTypeTrigger, 'L-1');

      const citizenRadio = screen.getByTestId('citizen-radio');
      await userEvent.click(citizenRadio);

      await waitFor(() => {
        const continueButton = screen.getByTestId('kyc-legal-status-cta');
        expect(continueButton).toBeInTheDocument();
      });
      const continueButton = screen.getByTestId('kyc-legal-status-cta');
      await userEvent.click(continueButton);

      await waitFor(() => {
        const args = {
          [IdDI.usLegalStatus]: {
            value: UsLegalStatus.citizen,
            ...otherValues,
          },
          [IdDI.nationality]: {
            value: 'US',
            ...otherValues,
          },
          [IdDI.citizenships]: {
            value: undefined,
            ...otherValues,
          },
          [IdDI.visaExpirationDate]: {
            value: undefined,
            ...otherValues,
          },
          [IdDI.visaKind]: {
            value: undefined,
            ...otherValues,
          },
        };
        expect(onComplete).toHaveBeenCalledWith(args);
      });
    });
  });

  describe('when the permanent resident status option is selected', () => {
    it('the country fields should be present', async () => {
      const initialContext = getInitialContext();
      renderLegalStatus(initialContext);

      const permanentResidentRadio = screen.getByTestId('permanent-resident-radio');
      await userEvent.click(permanentResidentRadio);

      const nationalitySelect = screen.getByTestId('nationality-select');
      expect(nationalitySelect).toBeInTheDocument();

      const citizenshipSelects = screen.getAllByText('Citizenship');
      expect(citizenshipSelects).toHaveLength(1);
    });

    it('the country fields should be required', async () => {
      const initialContext = getInitialContext();
      renderLegalStatus(initialContext);

      const permanentResidentRadio = screen.getByTestId('permanent-resident-radio');
      await userEvent.click(permanentResidentRadio);

      await waitFor(() => {
        const continueButton = screen.getByTestId('kyc-legal-status-cta');
        expect(continueButton).toBeInTheDocument();
      });
      const continueButton = screen.getByTestId('kyc-legal-status-cta');
      await userEvent.click(continueButton);

      await waitFor(() => {
        const nationalityError = screen.getByText('Country of birth cannot be empty');
        expect(nationalityError).toBeInTheDocument();
      });

      await waitFor(() => {
        const citizenshipError = screen.getByText('Citizenship cannot be empty');
        expect(citizenshipError).toBeInTheDocument();
      });
    });

    it('should error if the United States is chosen as a citizenship', async () => {
      const initialContext = getInitialContext();
      renderLegalStatus(initialContext);

      const permanentResidentRadio = screen.getByTestId('permanent-resident-radio');
      await userEvent.click(permanentResidentRadio);

      const countryTriggers = screen.getAllByRole('button', {
        name: 'Select',
      });
      expect(countryTriggers).toHaveLength(2);

      const nationalityTrigger = countryTriggers[0];
      await selectEvents.select(nationalityTrigger, 'United States of America');

      const citizenshipTrigger = countryTriggers[1];
      await selectEvents.select(citizenshipTrigger, 'United States of America');

      await waitFor(() => {
        const continueButton = screen.getByTestId('kyc-legal-status-cta');
        expect(continueButton).toBeInTheDocument();
      });
      const continueButton = screen.getByTestId('kyc-legal-status-cta');
      await userEvent.click(continueButton);

      await waitFor(() => {
        const usCitizenError = screen.getByText(
          'If you are a US citizen, please select the "I\'m a citizen" option above',
        );
        expect(usCitizenError).toBeInTheDocument();
      });
    });

    it('should submit status, country of birth, and citizenship', async () => {
      const onComplete = jest.fn();
      const initialContext = getInitialContext();
      renderLegalStatus(initialContext, onComplete);

      const permanentResidentRadio = screen.getByTestId('permanent-resident-radio');
      await userEvent.click(permanentResidentRadio);

      const countryTriggers = screen.getAllByRole('button', {
        name: 'Select',
      });
      expect(countryTriggers).toHaveLength(2);

      const nationalityTrigger = countryTriggers[0];
      await selectEvents.select(nationalityTrigger, 'United States of America');

      const citizenshipTrigger = countryTriggers[1];
      await selectEvents.select(citizenshipTrigger, 'Albania');

      await waitFor(() => {
        const continueButton = screen.getByTestId('kyc-legal-status-cta');
        expect(continueButton).toBeInTheDocument();
      });
      const continueButton = screen.getByTestId('kyc-legal-status-cta');
      await userEvent.click(continueButton);

      await waitFor(() => {
        const args = {
          [IdDI.usLegalStatus]: {
            value: UsLegalStatus.permanentResident,
            ...otherValues,
          },
          [IdDI.nationality]: {
            value: 'US',
            ...otherValues,
          },
          [IdDI.citizenships]: {
            value: ['AL'],
            ...otherValues,
          },
          [IdDI.visaExpirationDate]: {
            value: undefined,
            ...otherValues,
          },
          [IdDI.visaKind]: {
            value: undefined,
            ...otherValues,
          },
        };
        expect(onComplete).toHaveBeenCalledWith(args);
      });
    });

    it('should be able to add citizenships if the previous citizenship dropdown is not blank', async () => {
      const initialContext = getInitialContext();
      renderLegalStatus(initialContext);

      const permanentResidentRadio = screen.getByTestId('permanent-resident-radio');
      await userEvent.click(permanentResidentRadio);

      const countryTriggers = screen.getAllByRole('button', {
        name: 'Select',
      });
      expect(countryTriggers).toHaveLength(2);

      const citizenshipTrigger = countryTriggers[1];
      await selectEvents.select(citizenshipTrigger, 'Albania');

      await waitFor(() => {
        const addCitizenshipButton = screen.getByTestId('add-citizenship-button');
        expect(addCitizenshipButton).toBeInTheDocument();
      });
      const addCitizenshipButton = screen.getByTestId('add-citizenship-button');
      await userEvent.click(addCitizenshipButton);

      const newCountryTriggers = screen.getAllByRole('button', {
        name: 'Select',
      });
      expect(newCountryTriggers).toHaveLength(2);
    });

    it('should not be able to add citizenships if the previous one is blank', async () => {
      const initialContext = getInitialContext();
      renderLegalStatus(initialContext);

      const permanentResidentRadio = screen.getByTestId('permanent-resident-radio');
      await userEvent.click(permanentResidentRadio);

      await waitFor(() => {
        const addCitizenshipButton = screen.queryByTestId('add-citizenship-button');
        expect(addCitizenshipButton).toBeNull();
      });
    });

    it('should submit status, country of birth, and multiple citizenships', async () => {
      const onComplete = jest.fn();
      const initialContext = getInitialContext();
      renderLegalStatus(initialContext, onComplete);

      const permanentResidentRadio = screen.getByTestId('permanent-resident-radio');
      await userEvent.click(permanentResidentRadio);

      const countryTriggers = screen.getAllByRole('button', {
        name: 'Select',
      });
      expect(countryTriggers).toHaveLength(2);

      const nationalityTrigger = countryTriggers[0];
      await selectEvents.select(nationalityTrigger, 'United States of America');
      const citizenshipTrigger = countryTriggers[1];
      await selectEvents.select(citizenshipTrigger, 'Albania');

      await waitFor(() => {
        const addCitizenshipButton = screen.getByTestId('add-citizenship-button');
        expect(addCitizenshipButton).toBeInTheDocument();
      });
      const addCitizenshipButton = screen.getByTestId('add-citizenship-button');
      await userEvent.click(addCitizenshipButton);

      await waitFor(() => {
        const newCitizenshipTrigger = screen.getByRole('button', {
          name: 'Select',
        });
        expect(newCitizenshipTrigger).toBeInTheDocument();
      });
      const newCitizenshipTrigger = screen.getByRole('button', {
        name: 'Select',
      });
      await selectEvents.select(newCitizenshipTrigger, 'Andorra');

      await waitFor(() => {
        const continueButton = screen.getByTestId('kyc-legal-status-cta');
        expect(continueButton).toBeInTheDocument();
      });
      const continueButton = screen.getByTestId('kyc-legal-status-cta');
      await userEvent.click(continueButton);

      await waitFor(() => {
        const args = {
          [IdDI.usLegalStatus]: {
            value: UsLegalStatus.permanentResident,
            ...otherValues,
          },
          [IdDI.nationality]: {
            value: 'US',
            ...otherValues,
          },
          [IdDI.citizenships]: {
            value: ['AL', 'AD'],
            ...otherValues,
          },
          [IdDI.visaExpirationDate]: {
            value: undefined,
            ...otherValues,
          },
          [IdDI.visaKind]: {
            value: undefined,
            ...otherValues,
          },
        };
        expect(onComplete).toHaveBeenCalledWith(args);
      });
    });

    it('should not submit duplicate citizenships if multiple of the same country are added', async () => {
      const onComplete = jest.fn();
      const initialContext = getInitialContext();
      renderLegalStatus(initialContext, onComplete);

      const permanentResidentRadio = screen.getByTestId('permanent-resident-radio');
      await userEvent.click(permanentResidentRadio);

      const countryTriggers = screen.getAllByRole('button', {
        name: 'Select',
      });
      expect(countryTriggers).toHaveLength(2);

      const nationalityTrigger = countryTriggers[0];
      await selectEvents.select(nationalityTrigger, 'United States of America');
      const citizenshipTrigger = countryTriggers[1];
      await selectEvents.select(citizenshipTrigger, 'Albania');

      await waitFor(() => {
        const addCitizenshipButton = screen.getByTestId('add-citizenship-button');
        expect(addCitizenshipButton).toBeInTheDocument();
      });
      const addCitizenshipButton = screen.getByTestId('add-citizenship-button');
      await userEvent.click(addCitizenshipButton);

      await waitFor(() => {
        const newCitizenshipTrigger = screen.getByRole('button', {
          name: 'Select',
        });
        expect(newCitizenshipTrigger).toBeInTheDocument();
      });
      const newCitizenshipTrigger = screen.getByRole('button', {
        name: 'Select',
      });
      await selectEvents.select(newCitizenshipTrigger, 'Albania');

      await waitFor(() => {
        const continueButton = screen.getByTestId('kyc-legal-status-cta');
        expect(continueButton).toBeInTheDocument();
      });
      const continueButton = screen.getByTestId('kyc-legal-status-cta');
      await userEvent.click(continueButton);

      await waitFor(() => {
        const args = {
          [IdDI.usLegalStatus]: {
            value: UsLegalStatus.permanentResident,
            ...otherValues,
          },
          [IdDI.nationality]: {
            value: 'US',
            ...otherValues,
          },
          [IdDI.citizenships]: {
            value: ['AL'],
            ...otherValues,
          },
          [IdDI.visaExpirationDate]: {
            value: undefined,
            ...otherValues,
          },
          [IdDI.visaKind]: {
            value: undefined,
            ...otherValues,
          },
        };
        expect(onComplete).toHaveBeenCalledWith(args);
      });
    });

    it('the delete button should not be present when there is only one citizenship', async () => {
      const initialContext = getInitialContext();
      renderLegalStatus(initialContext);

      const permanentResidentRadio = screen.getByTestId('permanent-resident-radio');
      await userEvent.click(permanentResidentRadio);

      const citizenshipSelects = screen.getAllByText('Citizenship');
      expect(citizenshipSelects).toHaveLength(1);

      const deleteCitizenshipButtons = screen.queryAllByTestId('citizenship-delete-button');
      expect(deleteCitizenshipButtons).toHaveLength(0);
    });

    it('should not submit deleted citizenships', async () => {
      const onComplete = jest.fn();
      const initialContext = getInitialContext();
      renderLegalStatus(initialContext, onComplete);

      const permanentResidentRadio = screen.getByTestId('permanent-resident-radio');
      await userEvent.click(permanentResidentRadio);

      const countryTriggers = screen.getAllByRole('button', {
        name: 'Select',
      });
      expect(countryTriggers).toHaveLength(2);

      const nationalityTrigger = countryTriggers[0];
      await selectEvents.select(nationalityTrigger, 'United States of America');

      // Add 3 citizenships (AL, AF, DZ)
      const citizenshipTrigger = countryTriggers[1];
      await selectEvents.select(citizenshipTrigger, 'Albania');

      await waitFor(() => {
        const addCitizenshipButton = screen.getByTestId('add-citizenship-button');
        expect(addCitizenshipButton).toBeInTheDocument();
      });
      const addCitizenshipButton = screen.getByTestId('add-citizenship-button');
      await userEvent.click(addCitizenshipButton);
      await waitFor(() => {
        const citizenship2Trigger = screen.getByRole('button', {
          name: 'Select',
        });
        expect(citizenship2Trigger).toBeInTheDocument();
      });
      const citizenship2Trigger = screen.getByRole('button', {
        name: 'Select',
      });
      await selectEvents.select(citizenship2Trigger, 'Afghanistan');

      await waitFor(() => {
        const addCitizenship2Button = screen.getByTestId('add-citizenship-button');
        expect(addCitizenship2Button).toBeInTheDocument();
      });
      const addCitizenship2Button = screen.getByTestId('add-citizenship-button');
      await userEvent.click(addCitizenship2Button);
      await waitFor(() => {
        const citizenship3Trigger = screen.getByRole('button', {
          name: 'Select',
        });
        expect(citizenship3Trigger).toBeInTheDocument();
      });
      const citizenship3Trigger = screen.getByRole('button', {
        name: 'Select',
      });
      await selectEvents.select(citizenship3Trigger, 'Algeria');

      // Delete 3rd citizenship for a total of 2 remaining (AL, AF)
      await waitFor(() => {
        const deleteCitizenshipButtons = screen.queryAllByTestId('citizenship-delete-button');
        expect(deleteCitizenshipButtons).toHaveLength(3);
      });
      const deleteCitizenshipButtons = screen.queryAllByTestId('citizenship-delete-button');
      await userEvent.click(deleteCitizenshipButtons[2]);

      await waitFor(() => {
        const continueButton = screen.getByTestId('kyc-legal-status-cta');
        expect(continueButton).toBeInTheDocument();
      });
      const continueButton = screen.getByTestId('kyc-legal-status-cta');
      await userEvent.click(continueButton);

      await waitFor(() => {
        const args = {
          [IdDI.usLegalStatus]: {
            value: UsLegalStatus.permanentResident,
            ...otherValues,
          },
          [IdDI.nationality]: {
            value: 'US',
            ...otherValues,
          },
          [IdDI.citizenships]: {
            value: ['AL', 'AF'],
            ...otherValues,
          },
          [IdDI.visaExpirationDate]: {
            value: undefined,
            ...otherValues,
          },
          [IdDI.visaKind]: {
            value: undefined,
            ...otherValues,
          },
        };
        expect(onComplete).toHaveBeenCalledWith(args);
      });
    });
  });

  describe('when the visa status option is selected', () => {
    it('the country and the visa fields should be present', async () => {
      const initialContext = getInitialContext();
      renderLegalStatus(initialContext);

      const visaRadio = screen.getByTestId('visa-radio');
      await userEvent.click(visaRadio);

      const nationalitySelect = screen.getByTestId('nationality-select');
      expect(nationalitySelect).toBeInTheDocument();

      const citizenshipSelects = screen.getAllByText('Citizenship');
      expect(citizenshipSelects).toHaveLength(1);

      const visaKindSelect = screen.getByTestId('visa-kind-select');
      expect(visaKindSelect).toBeInTheDocument();

      const visaExpirationTextInput = screen.getByTestId('visa-expiration-textinput');
      expect(visaExpirationTextInput).toBeInTheDocument();
    });

    it('the country and the visa fields should all be required', async () => {
      const initialContext = getInitialContext();
      renderLegalStatus(initialContext);

      const visaRadio = screen.getByTestId('visa-radio');
      await userEvent.click(visaRadio);

      const continueButton = screen.getByTestId('kyc-legal-status-cta');
      expect(continueButton).toBeInTheDocument();

      await userEvent.click(continueButton);

      await waitFor(() => {
        const nationalityError = screen.getByText('Country of birth cannot be empty');
        expect(nationalityError).toBeInTheDocument();
      });

      await waitFor(() => {
        const citizenshipError = screen.getByText('Citizenship cannot be empty');
        expect(citizenshipError).toBeInTheDocument();
      });

      await waitFor(() => {
        const visaKindError = screen.getByText('Visa type cannot be empty');
        expect(visaKindError).toBeInTheDocument();
      });

      await waitFor(() => {
        const visaExpirationError = screen.getByText('Visa expiration date cannot be empty');
        expect(visaExpirationError).toBeInTheDocument();
      });
    });

    it('the visa expiration date should not be invalid, too far in the past, or too far in the future', async () => {
      const initialContext = getInitialContext();
      renderLegalStatus(initialContext);

      const visaRadio = screen.getByTestId('visa-radio');
      await userEvent.click(visaRadio);

      const nationalitySelect = screen.getByTestId('nationality-select');
      expect(nationalitySelect).toBeInTheDocument();

      const triggers = screen.getAllByRole('button', {
        name: 'Select',
      });
      expect(triggers).toHaveLength(3);
      const nationalityTrigger = triggers[0];
      await selectEvents.select(nationalityTrigger, 'United States of America');
      const citizenshipTrigger = triggers[1];
      await selectEvents.select(citizenshipTrigger, 'Afghanistan');
      const visaTrigger = triggers[2];
      await selectEvents.select(visaTrigger, 'H-1B');

      const visaExpirationTextInput = screen.getByTestId('visa-expiration-textinput');

      const before1900 = 1899;
      await userEvent.type(visaExpirationTextInput, `01/01/${before1900}`);
      await waitFor(() => {
        const continueButton = screen.getByTestId('kyc-legal-status-cta');
        expect(continueButton).toBeInTheDocument();
      });
      const continueButton = screen.getByTestId('kyc-legal-status-cta');
      await userEvent.click(continueButton);
      await waitFor(() => {
        const visaExpirationError = screen.getByText('Visa expiration date is invalid');
        expect(visaExpirationError).toBeInTheDocument();
      });

      const after3000 = 3001;
      await userEvent.type(visaExpirationTextInput, `01/01/${after3000}`);
      await userEvent.click(continueButton);
      await waitFor(() => {
        const visaExpirationError = screen.getByText('Visa expiration date is invalid');
        expect(visaExpirationError).toBeInTheDocument();
      });
    });

    it('should submit status, country of birth, multiple citizenships, visa type, and visa expiration', async () => {
      const onComplete = jest.fn();
      const initialContext = getInitialContext();
      renderLegalStatus(initialContext, onComplete);

      const visaRadio = screen.getByTestId('visa-radio');
      await userEvent.click(visaRadio);

      const triggers = screen.getAllByRole('button', {
        name: 'Select',
      });
      expect(triggers).toHaveLength(3);

      const nationalityTrigger = triggers[0];
      await selectEvents.select(nationalityTrigger, 'United States of America');
      const citizenshipTrigger = triggers[1];
      await selectEvents.select(citizenshipTrigger, 'Albania');

      const visaTypeTrigger = triggers[2];
      await selectEvents.select(visaTypeTrigger, 'L-1');
      const visaExpirationTextInput = screen.getByTestId('visa-expiration-textinput');
      await userEvent.type(visaExpirationTextInput, '01012100');

      await waitFor(() => {
        const addCitizenshipButton = screen.getByTestId('add-citizenship-button');
        expect(addCitizenshipButton).toBeInTheDocument();
      });
      const addCitizenshipButton = screen.getByTestId('add-citizenship-button');
      await userEvent.click(addCitizenshipButton);
      await waitFor(() => {
        const newCitizenshipTrigger = screen.getByRole('button', {
          name: 'Select',
        });
        expect(newCitizenshipTrigger).toBeInTheDocument();
      });
      const newCitizenshipTrigger = screen.getByRole('button', {
        name: 'Select',
      });
      await selectEvents.select(newCitizenshipTrigger, 'Andorra');

      await waitFor(() => {
        const continueButton = screen.getByTestId('kyc-legal-status-cta');
        expect(continueButton).toBeInTheDocument();
      });
      const continueButton = screen.getByTestId('kyc-legal-status-cta');
      await userEvent.click(continueButton);
      await waitFor(() => {
        const args: KycData = {
          [IdDI.usLegalStatus]: {
            value: UsLegalStatus.visa,
            ...otherValues,
          },
          [IdDI.nationality]: {
            value: 'US',
            ...otherValues,
          },
          [IdDI.citizenships]: {
            value: ['AL', 'AD'],
            ...otherValues,
          },
          [IdDI.visaKind]: {
            value: VisaKind.l1,
            ...otherValues,
          },
          [IdDI.visaExpirationDate]: {
            value: '01/01/2100',
            ...otherValues,
          },
        };
        expect(onComplete).toHaveBeenCalledWith(args);
      });
    });
  });
});
