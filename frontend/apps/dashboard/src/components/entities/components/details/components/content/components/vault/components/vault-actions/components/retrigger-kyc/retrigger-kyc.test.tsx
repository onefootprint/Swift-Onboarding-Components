import {
  createUseRouterSpy,
  customRender,
  screen,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
} from '@onefootprint/test-utils';
import { Entity, EntityKind, EntityStatus } from '@onefootprint/types';
import React from 'react';

import RetriggerKYC from './retrigger-kyc';
import { withTrigger, withTriggerError } from './retrigger-kyc.test.config';

const useRouterSpy = createUseRouterSpy();

const renderRetriggerKYC = async () =>
  customRender(<RetriggerKYC entity={entityFixture} />);

const entityFixture: Entity = {
  id: 'fp_id_yCZehsWNeywHnk5JqL20u',
  isPortable: true,
  kind: EntityKind.person,
  attributes: [],
  decryptableAttributes: [],
  startTimestamp: '2023-03-27T14:43:47.444716Z',
  requiresManualReview: false,
  status: EntityStatus.pass,
  decryptedAttributes: {},
  watchlistCheck: null,
};

describe.skip('<RetriggerKYC />', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname: `/entities/${entityFixture.id}/trigger`,
      query: {
        id: entityFixture.id,
      },
    });
  });

  describe('when the request to trigger request succeeds', () => {
    beforeEach(() => {
      withTrigger(entityFixture.id);
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
      withTriggerError(entityFixture.id);
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
