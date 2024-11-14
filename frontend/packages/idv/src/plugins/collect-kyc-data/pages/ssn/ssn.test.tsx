import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { IdDI } from '@onefootprint/types';

import type { InitMachineArgs } from '../../utils/state-machine/machine';
import TestWrapper from '../../utils/test-wrapper';
import Ssn from './ssn';
import { getInitialContext, withUserVault, withUserVaultError } from './ssn.test.config';

const renderSsn = (initialContext: InitMachineArgs, onComplete?: () => void) => {
  return customRender(
    <TestWrapper initialContext={initialContext} initState="confirm">
      <Ssn onComplete={onComplete} />
    </TestWrapper>,
  );
};

describe('<SSN />', () => {
  const otherValues = {
    decrypted: false,
    scrubbed: false,
    bootstrap: false,
    dirty: false,
  };

  describe('SSN4 (Last four)', () => {
    describe('when it has existing data', () => {
      beforeEach(() => {
        withUserVault();
      });

      it('should prefill the input', async () => {
        const data = {
          [IdDI.ssn4]: { value: '1234', ...otherValues },
        };
        const initialContext = getInitialContext(data, 'ssn4');
        const onComplete = jest.fn();
        renderSsn(initialContext, onComplete);

        const ssnInput = screen.getByLabelText('SSN (last 4)');
        expect(ssnInput).toHaveValue('1234');

        const submitButton = screen.getByRole('button', { name: 'Continue' });
        await userEvent.click(submitButton);

        await waitFor(() => {
          expect(onComplete).toHaveBeenCalled();
        });
      });
    });

    it('should show the correct header title', async () => {
      const initialContext = getInitialContext({}, 'ssn4');
      const onComplete = jest.fn();
      renderSsn(initialContext, onComplete);

      await waitFor(() => {
        const header = screen.getByText('What are the last 4 digits of your Social Security Number?');
        expect(header).toBeInTheDocument();
      });
    });

    describe('when submitting the form', () => {
      it('should show an error message if input is empty', async () => {
        const initialContext = getInitialContext({}, 'ssn4');
        const onComplete = jest.fn();
        renderSsn(initialContext, onComplete);

        const submitButton = screen.getByRole('button', { name: 'Continue' });
        await userEvent.click(submitButton);

        await waitFor(() => {
          const errorMessage = screen.getByText('SSN cannot be empty');
          expect(errorMessage).toBeInTheDocument();
        });
        expect(onComplete).not.toHaveBeenCalled();
      });

      it('should show an error message if input is invalid', async () => {
        const initialContext = getInitialContext({}, 'ssn4');
        const onComplete = jest.fn();
        renderSsn(initialContext, onComplete);

        const ssnInput = screen.getByLabelText('SSN (last 4)');
        await userEvent.type(ssnInput, '1');

        const submitButton = screen.getByRole('button', { name: 'Continue' });
        await userEvent.click(submitButton);

        await waitFor(() => {
          const errorMessage = screen.getByText('SSN is invalid');
          expect(errorMessage).toBeInTheDocument();
        });
        expect(onComplete).not.toHaveBeenCalled();
      });

      describe('when the request fails', () => {
        beforeEach(() => {
          withUserVaultError('ssn4');
        });

        it('should shown an inline error', async () => {
          const initialContext = getInitialContext({}, 'ssn4');
          const onComplete = jest.fn();
          renderSsn(initialContext, onComplete);

          const ssnInput = screen.getByLabelText('SSN (last 4)');
          await userEvent.type(ssnInput, '1234');

          const submitButton = screen.getByRole('button', { name: 'Continue' });
          await userEvent.click(submitButton);

          await waitFor(() => {
            const errorMessage = screen.getByText('Invalid SSN');
            expect(errorMessage).toBeInTheDocument();
          });
          expect(onComplete).not.toHaveBeenCalled();
        });
      });

      describe('when the request succeeds', () => {
        beforeEach(() => {
          withUserVault();
        });

        it('should trigger onComplete', async () => {
          const initialContext = getInitialContext({}, 'ssn4');
          const onComplete = jest.fn();
          renderSsn(initialContext, onComplete);

          const ssnInput = screen.getByLabelText('SSN (last 4)');
          await userEvent.type(ssnInput, '1234');

          const submitButton = screen.getByRole('button', { name: 'Continue' });
          await userEvent.click(submitButton);

          await waitFor(() => {
            expect(onComplete).toHaveBeenCalledWith({
              'id.ssn4': {
                bootstrap: false,
                decrypted: false,
                scrubbed: false,
                dirty: false,
                value: '1234',
              },
            });
          });
        });
      });
    });
  });

  describe('SSN9 (full)', () => {
    describe('when it has existing data', () => {
      beforeEach(() => {
        withUserVault();
      });

      it('should prefill the input', async () => {
        const data = {
          [IdDI.ssn9]: { value: '121212121', ...otherValues },
        };
        const initialContext = getInitialContext(data, 'ssn9');
        const onComplete = jest.fn();
        renderSsn(initialContext, onComplete);

        const ssnInput = screen.getByLabelText('SSN');
        expect(ssnInput).toHaveValue('121-21-2121');

        const submitButton = screen.getByRole('button', { name: 'Continue' });
        await userEvent.click(submitButton);

        await waitFor(() => {
          expect(onComplete).toHaveBeenCalled();
        });
      });
    });

    it('should show the correct header title', async () => {
      const initialContext = getInitialContext({}, 'ssn9');
      const onComplete = jest.fn();
      renderSsn(initialContext, onComplete);

      await waitFor(() => {
        const header = screen.getByText("What's your Social Security Number?");
        expect(header).toBeInTheDocument();
      });
    });

    describe('when submitting the form', () => {
      it('should show an error message if input is empty', async () => {
        const initialContext = getInitialContext({}, 'ssn9');
        const onComplete = jest.fn();
        renderSsn(initialContext, onComplete);

        const submitButton = screen.getByRole('button', { name: 'Continue' });
        await userEvent.click(submitButton);

        await waitFor(() => {
          const errorMessage = screen.getByText('SSN cannot be empty or is invalid');
          expect(errorMessage).toBeInTheDocument();
        });
        expect(onComplete).not.toHaveBeenCalled();
      });

      it('should show an error message if input is invalid', async () => {
        const initialContext = getInitialContext({}, 'ssn9');
        const onComplete = jest.fn();
        renderSsn(initialContext, onComplete);

        const ssnInput = screen.getByLabelText('SSN');
        await userEvent.type(ssnInput, '1');

        const submitButton = screen.getByRole('button', { name: 'Continue' });
        await userEvent.click(submitButton);

        await waitFor(() => {
          const errorMessages = screen.getByText('SSN cannot be empty or is invalid');
          expect(errorMessages).toBeInTheDocument();
        });
        expect(onComplete).not.toHaveBeenCalled();
      });

      describe('when the request fails', () => {
        beforeEach(() => {
          withUserVaultError('ssn9');
        });

        it('should shown an inline error', async () => {
          const initialContext = getInitialContext({}, 'ssn9');
          const onComplete = jest.fn();
          renderSsn(initialContext, onComplete);

          const ssnInput = screen.getByLabelText('SSN');
          await userEvent.type(ssnInput, '121212121');

          const submitButton = screen.getByRole('button', { name: 'Continue' });
          await userEvent.click(submitButton);

          await waitFor(() => {
            const errorMessages = screen.getByText('Invalid SSN');
            expect(errorMessages).toBeInTheDocument();
          });
          expect(onComplete).not.toHaveBeenCalled();
        });
      });

      describe('when the request succeeds', () => {
        beforeEach(() => {
          withUserVault();
        });

        it('should trigger onComplete', async () => {
          const initialContext = getInitialContext({}, 'ssn9');
          const onComplete = jest.fn();
          renderSsn(initialContext, onComplete);

          const ssnInput = screen.getByLabelText('SSN');
          await userEvent.type(ssnInput, '121212121');

          const submitButton = screen.getByRole('button', { name: 'Continue' });
          await userEvent.click(submitButton);

          await waitFor(() => {
            expect(onComplete).toHaveBeenCalledWith({
              'id.ssn9': {
                bootstrap: false,
                decrypted: false,
                dirty: false,
                scrubbed: false,
                value: '121-21-2121',
              },
            });
          });
        });
      });
    });
  });

  describe('ITIN', () => {
    describe('when it has existing data', () => {
      beforeEach(() => {
        withUserVault();
      });

      it('should prefill the input', async () => {
        const data = {
          [IdDI.usTaxId]: { value: '121-21-2121', ...otherValues },
        };
        const initialContext = getInitialContext(data, 'us_tax_id');
        const onComplete = jest.fn();
        renderSsn(initialContext, onComplete);

        const ssnInput = screen.getByLabelText('SSN');
        expect(ssnInput).toHaveValue('121-21-2121');

        const submitButton = screen.getByRole('button', { name: 'Continue' });
        await userEvent.click(submitButton);

        await waitFor(() => {
          expect(onComplete).toHaveBeenCalled();
        });
      });

      describe('when the us_tax_id is a ssn9', () => {
        it('should show the correct input label', async () => {
          const data = {
            [IdDI.usTaxId]: { value: '121-21-2121', ...otherValues },
          };
          const initialContext = getInitialContext(data, 'us_tax_id');
          const onComplete = jest.fn();
          renderSsn(initialContext, onComplete);

          const ssnInput = screen.getByLabelText('SSN');
          expect(ssnInput).toBeInTheDocument();
        });
      });

      describe('when the us_tax_id is an itin', () => {
        it('should show the correct input label', async () => {
          const data = {
            [IdDI.usTaxId]: { value: '911-88-1234', ...otherValues },
          };
          const initialContext = getInitialContext(data, 'us_tax_id');
          const onComplete = jest.fn();
          renderSsn(initialContext, onComplete);

          const ssnInput = screen.getByLabelText('ITIN');
          expect(ssnInput).toBeInTheDocument();
        });
      });
    });

    it('should show the correct header title', async () => {
      const initialContext = getInitialContext({}, 'us_tax_id');
      const onComplete = jest.fn();
      renderSsn(initialContext, onComplete);

      await waitFor(() => {
        const header = screen.getByText("What's your Tax ID?");
        expect(header).toBeInTheDocument();
      });
    });

    describe('when submitting the form', () => {
      it('should show an error message if input is empty', async () => {
        const initialContext = getInitialContext({}, 'us_tax_id');
        const onComplete = jest.fn();
        renderSsn(initialContext, onComplete);

        const submitButton = screen.getByRole('button', { name: 'Continue' });
        await userEvent.click(submitButton);

        await waitFor(() => {
          const errorMessages = screen.getByText('SSN or ITIN cannot be empty or is invalid');
          expect(errorMessages).toBeInTheDocument();
        });
        expect(onComplete).not.toHaveBeenCalled();
      });

      it('should show an error message if input is invalid', async () => {
        const initialContext = getInitialContext({}, 'us_tax_id');
        const onComplete = jest.fn();
        renderSsn(initialContext, onComplete);

        const ssnInput = screen.getByLabelText('Tax ID');
        await userEvent.type(ssnInput, '1');

        const submitButton = screen.getByRole('button', { name: 'Continue' });
        await userEvent.click(submitButton);

        await waitFor(() => {
          const errorMessage = screen.getByText('SSN or ITIN cannot be empty or is invalid');
          expect(errorMessage).toBeInTheDocument();
        });
        expect(onComplete).not.toHaveBeenCalled();
      });

      describe('when the request fails', () => {
        beforeEach(() => {
          withUserVaultError('us_tax_id');
        });

        it('should shown an inline error', async () => {
          const initialContext = getInitialContext({}, 'us_tax_id');
          const onComplete = jest.fn();
          renderSsn(initialContext, onComplete);

          const ssnInput = screen.getByLabelText('Tax ID');
          await userEvent.type(ssnInput, '121212121');

          const submitButton = screen.getByRole('button', { name: 'Continue' });
          await userEvent.click(submitButton);

          await waitFor(() => {
            const errorMessage = screen.getByText('Invalid US Tax ID');
            expect(errorMessage).toBeInTheDocument();
          });
          expect(onComplete).not.toHaveBeenCalled();
        });
      });

      describe('when the request succeeds', () => {
        beforeEach(() => {
          withUserVault();
        });

        it('should trigger onComplete', async () => {
          const initialContext = getInitialContext({}, 'us_tax_id');
          const onComplete = jest.fn();
          renderSsn(initialContext, onComplete);

          const ssnInput = screen.getByLabelText('Tax ID');
          await userEvent.type(ssnInput, '121212121');

          const submitButton = screen.getByRole('button', { name: 'Continue' });
          await userEvent.click(submitButton);

          await waitFor(() => {
            expect(onComplete).toHaveBeenCalledWith({
              'id.us_tax_id': {
                bootstrap: false,
                decrypted: false,
                dirty: false,
                scrubbed: false,
                value: '121-21-2121',
              },
            });
          });
        });
      });
    });
  });
});
