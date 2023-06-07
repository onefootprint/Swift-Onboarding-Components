import {
  createUseRouterSpy,
  customRender,
  screen,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
} from '@onefootprint/test-utils';
import React from 'react';
import { useStore } from 'src/hooks/use-session';

import RetriggerKYC from './retrigger-kyc';
import { withTrigger, withTriggerError } from './retrigger-kyc.test.config';

const useRouterSpy = createUseRouterSpy();

const renderRetriggerKYC = async () => customRender(<RetriggerKYC />);

const originalState = useStore.getState();

describe('<RetriggerKYC />', () => {
  const entityId = 'fp_id_yCZehsWNeywHnk5JqL20u';

  beforeEach(() => {
    useRouterSpy({
      pathname: `/entities/${entityId}/trigger`,
      query: {
        id: entityId,
      },
    });

    useStore.setState({
      ...originalState,
      data: {
        user: {
          isFirmEmployee: true,
          id: entityId,
          firstName: 'Lucas',
          lastName: 'Gelfond',
          email: 'lucas@onefootprint.com',
          scopes: [],
          isAssumedSession: true,
        },
        meta: { ...originalState.data.meta },
      },
    });
  });

  describe('when the request to trigger request succeeds', () => {
    beforeEach(() => {
      withTrigger(entityId);
    });

    it('should close the dialog and show a confirmation message', async () => {
      renderRetriggerKYC();

      const button = screen.getByRole('button', {
        name: 'Open actions',
      });
      await userEvent.click(button);

      const dropdownItem = screen.getByText('Request more information...');
      await userEvent.click(dropdownItem);

      const dialog = screen.getByRole('dialog', {
        name: 'Request more information',
      });
      const reuploadPhotoRadio = screen.getByRole('radio', {
        name: 'Re-upload ID photo',
      });
      await userEvent.click(reuploadPhotoRadio);

      const noteTextArea = screen.getByRole('textbox', {
        name: 'Note for user (optional)',
      });
      await userEvent.type(noteTextArea, 'Lorem ipsum');

      const submitButton = screen.getByRole('button', {
        name: 'Send request',
      });
      await userEvent.click(submitButton);

      await waitForElementToBeRemoved(dialog);

      await waitFor(() => {
        const successConfirmation = screen.getByText(
          'User will receive an SMS detailing the next steps shortly',
        );
        expect(successConfirmation).toBeInTheDocument();
      });
    });
  });

  describe('when the request to trigger request fails', () => {
    beforeEach(() => {
      withTriggerError(entityId);
    });

    it('should show an error message', async () => {
      renderRetriggerKYC();

      const button = screen.getByRole('button', {
        name: 'Open actions',
      });
      await userEvent.click(button);

      const dropdownItem = screen.getByText('Request more information...');
      await userEvent.click(dropdownItem);

      const reuploadPhotoRadio = screen.getByRole('radio', {
        name: 'Re-upload ID photo',
      });
      await userEvent.click(reuploadPhotoRadio);

      const submitButton = screen.getByRole('button', {
        name: 'Send request',
      });
      await userEvent.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText('Something went wrong');
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });
});
