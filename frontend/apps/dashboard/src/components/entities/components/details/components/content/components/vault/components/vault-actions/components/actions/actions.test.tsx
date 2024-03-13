import {
  createUseRouterSpy,
  customRender,
  screen,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
} from '@onefootprint/test-utils';
import { OrgFrequentNoteKind } from '@onefootprint/types';
import React from 'react';
import {
  withFrequentNotes,
  withPlaybooks,
} from 'src/components/frequent-notes-text-area/frequent-notes-text-area.test.config';
import { asAdminUser } from 'src/config/tests';

import TestWrapper from '../../../utils/test-wrapper';
import Actions from './actions';
import {
  entityId,
  entityWithoutPhoneFixture,
  entityWithPhoneFixture,
  withEntity,
  withTokenSendLink,
  withTrigger,
  withTriggerError,
} from './actions.test.config';

const useRouterSpy = createUseRouterSpy();

const renderActions = async (isNoPhone?: boolean) =>
  customRender(
    <TestWrapper>
      <Actions
        entity={isNoPhone ? entityWithoutPhoneFixture : entityWithPhoneFixture}
      />
    </TestWrapper>,
  );

describe('<Actions />', () => {
  beforeEach(() => {
    withFrequentNotes(OrgFrequentNoteKind.Trigger, []);
    withPlaybooks();
    useRouterSpy({
      asPath: `/entities/${entityId}&mode=sandbox`,
      pathname: '/users/[id]',
      query: {
        id: entityId,
      },
    });
    asAdminUser();
  });

  describe('when retriggering a KYC', () => {
    describe('when the request to trigger request succeeds', () => {
      describe('when user does not have phone', () => {
        beforeEach(() => {
          withEntity(entityWithoutPhoneFixture);
          withTrigger();
          withTokenSendLink('email');
        });

        it('should close the dialog and show a confirmation message for email sent', async () => {
          renderActions(true);

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

          expect(
            screen.getByText(
              "We'll send an email with a link with your request to the user's email address on file.",
            ),
          ).toBeInTheDocument();

          const nextButton = screen.getByRole('button', {
            name: 'Next',
          });
          await userEvent.click(nextButton);
          await waitFor(() => {
            expect(
              screen.getByDisplayValue('http://footprint.link/#tok_xxx'),
            ).toBeInTheDocument();
          });
          const sendButton = screen.getByRole('button', {
            name: 'Send via email',
          });
          await userEvent.click(sendButton);

          await waitForElementToBeRemoved(dialog);

          await waitFor(() => {
            const successConfirmation = screen.getByText(
              'User will receive an email detailing the next steps shortly',
            );
            expect(successConfirmation).toBeInTheDocument();
          });
        });
      });

      describe('when user has phone', () => {
        beforeEach(() => {
          withEntity(entityWithPhoneFixture);
          withTrigger();
          withTokenSendLink('phone');
        });

        it('should close the dialog and show a confirmation message for SMS sent', async () => {
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

          expect(
            screen.getByText(
              "We'll send an SMS with a link with your request to the user's phone number on file.",
            ),
          ).toBeInTheDocument();

          const nextButton = screen.getByRole('button', {
            name: 'Next',
          });
          await userEvent.click(nextButton);
          await waitFor(() => {
            expect(
              screen.getByDisplayValue('http://footprint.link/#tok_xxx'),
            ).toBeInTheDocument();
          });
          const sendButton = screen.getByRole('button', {
            name: 'Send via SMS',
          });
          await userEvent.click(sendButton);

          await waitForElementToBeRemoved(dialog);

          await waitFor(() => {
            const successConfirmation = screen.getByText(
              'User will receive an SMS detailing the next steps shortly',
            );
            expect(successConfirmation).toBeInTheDocument();
          });
        });
      });
    });

    describe('when the request to trigger request fails', () => {
      beforeEach(() => {
        withEntity(entityWithPhoneFixture);
        withTriggerError();
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

        const nextButton = screen.getByRole('button', {
          name: 'Next',
        });
        await userEvent.click(nextButton);

        await waitFor(() => {
          const errorMessage = screen.getByText('Something went wrong');
          expect(errorMessage).toBeInTheDocument();
        });
      });
    });
  });
});
