import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { IdDI } from '@onefootprint/types';
import React from 'react';

import type { InitMachineArgs } from '../../utils/state-machine/machine';
import TestWrapper from '../../utils/test-wrapper';
import Ssn from './ssn';
import { getInitialContext, withUserVault, withUserVaultError } from './ssn.test.config';

const renderSsn = (initialContext: InitMachineArgs, onComplete?: () => void) => {
  customRender(
    <TestWrapper initialContext={initialContext} initState="confirm">
      <Ssn onComplete={onComplete} />
    </TestWrapper>,
  );
};

describe('Ssn', () => {
  const otherValues = {
    disabled: false,
    decrypted: false,
    scrubbed: false,
    bootstrap: false,
    dirty: false,
  };

  describe('when the page is shown with existing data', () => {
    beforeEach(() => {
      withUserVault();
    });

    it('any existing SSN4 should be filled by default', async () => {
      const data = {
        [IdDI.ssn4]: {
          value: '1234',
          ...otherValues,
        },
      };
      const initialContext = getInitialContext(data, 'ssn4');
      const onComplete = jest.fn();
      renderSsn(initialContext, onComplete);

      await waitFor(() => {
        expect(screen.getByText('What are the last 4 digits of your Social Security Number?')).toBeInTheDocument();
      });

      const ssn = screen.getByLabelText('SSN (last 4)');
      expect(ssn).toHaveValue('1234');

      const submitButton = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(submitButton);
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });
    });

    it('any existing SSN9 should be filled by default', async () => {
      const data = {
        [IdDI.ssn9]: {
          value: '121212121',
          ...otherValues,
        },
      };
      const initialContext = getInitialContext(data, 'ssn9');
      const onComplete = jest.fn();
      renderSsn(initialContext, onComplete);

      await waitFor(() => {
        expect(screen.getByText("What's your Social Security Number?")).toBeInTheDocument();
      });

      const ssn = screen.getByLabelText('SSN');
      expect(ssn).toHaveValue('121-21-2121');

      const submitButton = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(submitButton);
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });
    });
  });

  describe('when the user input fails input validations', () => {
    it('shows errors when the ssn4 field is empty', async () => {
      const initialContext = getInitialContext({}, 'ssn4');
      const onComplete = jest.fn();
      renderSsn(initialContext, onComplete);

      await waitFor(() => {
        expect(screen.getByText('What are the last 4 digits of your Social Security Number?')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('SSN cannot be empty or is invalid')).toBeInTheDocument();
      });
      expect(onComplete).not.toHaveBeenCalled();
    });

    it('shows errors when the ssn9 field is empty', async () => {
      const initialContext = getInitialContext({}, 'ssn9');
      const onComplete = jest.fn();
      renderSsn(initialContext, onComplete);

      await waitFor(() => {
        expect(screen.getByText("What's your Social Security Number?")).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('SSN cannot be empty or is invalid')).toBeInTheDocument();
      });
      expect(onComplete).not.toHaveBeenCalled();
    });

    it('shows errors when ssn4 input is invalid', async () => {
      const initialContext = getInitialContext({}, 'ssn4');
      const onComplete = jest.fn();
      renderSsn(initialContext, onComplete);

      await waitFor(() => {
        expect(screen.getByText('What are the last 4 digits of your Social Security Number?')).toBeInTheDocument();
      });

      const ssn = screen.getByLabelText('SSN (last 4)');
      await userEvent.type(ssn, '1');

      const submitButton = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('SSN cannot be empty or is invalid')).toBeInTheDocument();
      });
      expect(onComplete).not.toHaveBeenCalled();
    });

    it('shows errors when ssn9 input is invalid', async () => {
      const initialContext = getInitialContext({}, 'ssn9');
      const onComplete = jest.fn();
      renderSsn(initialContext, onComplete);

      await waitFor(() => {
        expect(screen.getByText("What's your Social Security Number?")).toBeInTheDocument();
      });

      const ssn = screen.getByLabelText('SSN');
      await userEvent.type(ssn, '999999999'); // SSN cannot contain 9s

      const submitButton = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('SSN cannot be empty or is invalid')).toBeInTheDocument();
      });
      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe('when ssn4 validation fails', () => {
    beforeEach(() => {
      withUserVaultError('ssn4');
    });

    it('shows errors as hints', async () => {
      const initialContext = getInitialContext({}, 'ssn4');
      const onComplete = jest.fn();
      renderSsn(initialContext, onComplete);

      await waitFor(() => {
        expect(screen.getByText('What are the last 4 digits of your Social Security Number?')).toBeInTheDocument();
      });

      const ssn = screen.getByLabelText('SSN (last 4)');
      await userEvent.type(ssn, '1234');

      const submitButton = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid SSN')).toBeInTheDocument();
      });

      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe('when ssn9 validation fails', () => {
    beforeEach(() => {
      withUserVaultError('ssn9');
    });

    it('shows errors as hints', async () => {
      const initialContext = getInitialContext({}, 'ssn9');
      const onComplete = jest.fn();
      renderSsn(initialContext, onComplete);

      await waitFor(() => {
        expect(screen.getByText("What's your Social Security Number?")).toBeInTheDocument();
      });

      const ssn = screen.getByLabelText('SSN');
      await userEvent.type(ssn, '121212121');

      const submitButton = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid SSN')).toBeInTheDocument();
      });

      expect(onComplete).not.toHaveBeenCalled();
    });
  });
});
