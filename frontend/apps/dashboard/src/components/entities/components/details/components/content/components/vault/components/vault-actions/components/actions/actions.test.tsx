import {
  createUseRouterSpy,
  customRender,
  screen,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
} from '@onefootprint/test-utils';
import React from 'react';

import Actions from './actions';
import {
  entityFixture,
  withEntity,
  withTrigger,
  withTriggerError,
} from './actions.test.config';

const useRouterSpy = createUseRouterSpy();

const renderActions = async () =>
  customRender(<Actions entity={entityFixture} />);

describe('<Actions />', () => {
  beforeEach(() => {
    withEntity(entityFixture.id);
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
      renderActions();

      const button = screen.getByRole('button', {
        name: 'Open actions',
      });
      await userEvent.click(button);

      const dropdownItem = screen.getByText('Request more information');
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
      renderActions();

      const button = screen.getByRole('button', {
        name: 'Open actions',
      });
      await userEvent.click(button);

      const dropdownItem = screen.getByText('Request more information');
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
