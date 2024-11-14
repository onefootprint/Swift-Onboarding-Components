import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { IdDI } from '@onefootprint/types';

import type { InitMachineArgs } from '../../utils/state-machine/machine';
import TestWrapper from '../../utils/test-wrapper';
import BasicInformation from './basic-information';
import { getInitialContext, withUserVault, withUserVaultError } from './basic-information.test.config';

const renderBasicInformation = (initialContext: InitMachineArgs, onComplete?: () => void) => {
  customRender(
    <TestWrapper initialContext={initialContext} initState="confirm">
      <BasicInformation onComplete={onComplete} />
    </TestWrapper>,
  );
};

describe('BasicInformation', () => {
  const otherValues = {
    decrypted: false,
    scrubbed: false,
    bootstrap: false,
    dirty: false,
  };

  describe('when the page is initially shown', () => {
    beforeEach(() => {
      withUserVault();
    });

    it('any existing data should be filled by default', async () => {
      const data = {
        [IdDI.firstName]: {
          value: 'Piip',
          ...otherValues,
        },
        [IdDI.middleName]: {
          value: 'Middle',
          ...otherValues,
        },
        [IdDI.lastName]: {
          value: 'Test',
          ...otherValues,
        },
        [IdDI.dob]: {
          value: '01/01/2222',
          ...otherValues,
        },
      };
      const initialContext = getInitialContext(data);
      const onComplete = jest.fn();
      renderBasicInformation(initialContext, onComplete);

      const firstName = screen.getByLabelText('First name');
      expect(firstName).toHaveValue('Piip');

      const middleName = screen.getByLabelText('Middle name (optional)');
      expect(middleName).toHaveValue('Middle');

      const lastName = screen.getByLabelText('Last name');
      expect(lastName).toHaveValue('Test');

      const dob = screen.getByLabelText('Date of Birth');
      expect(dob).toHaveValue('01/01/2222');

      const submitButton = screen.getByRole('button', { name: 'Continue' });
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('when validation fails', () => {
    beforeEach(() => {
      withUserVaultError();
    });

    it('shows errors as hints', async () => {
      const initialContext = getInitialContext({});
      const onComplete = jest.fn();
      renderBasicInformation(initialContext, onComplete);

      await waitFor(() => {
        expect(screen.getByText('Basic Data')).toBeInTheDocument();
      });

      const firstName = screen.getByLabelText('First name');
      await userEvent.type(firstName, 'Piip');

      const middleName = screen.getByLabelText('Middle name (optional)');
      await userEvent.type(middleName, 'Middle');

      const lastName = screen.getByLabelText('Last name');
      await userEvent.type(lastName, 'Test');

      const dob = screen.getByLabelText('Date of Birth');
      await userEvent.type(dob, '01/01/1990');

      const submitButton = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('First name error')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('Last name error')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('Date of birth error')).toBeInTheDocument();
      });

      expect(onComplete).not.toHaveBeenCalled();
    });
  });
});
