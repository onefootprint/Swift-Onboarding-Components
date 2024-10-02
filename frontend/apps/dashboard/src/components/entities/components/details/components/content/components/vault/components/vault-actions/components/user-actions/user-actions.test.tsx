import {
  customRender,
  fireEvent,
  mockRequest,
  mockRouter,
  screen,
  selectEvents,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
} from '@onefootprint/test-utils';
import { OrgFrequentNoteKind } from '@onefootprint/types';
import {
  withFrequentNotes,
  withPlaybooks,
} from 'src/components/frequent-notes-text-area/frequent-notes-text-area.test.config';
import { asAdminUser } from 'src/config/tests';

import TestWrapper from '../../../utils/test-wrapper';
import UserActions from './user-actions';
import {
  entityId,
  entityWithPhoneFixture,
  entityWithoutPhoneFixture,
  withData,
  withDocuments,
  withEntity,
  withLists,
  withTags,
  withTimeline,
  withTokenSendLink,
  withTrigger,
  withTriggerError,
} from './user-actions.test.config';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

const renderActions = async (isNoPhone?: boolean) =>
  customRender(
    <TestWrapper>
      <UserActions entity={isNoPhone ? entityWithoutPhoneFixture : entityWithPhoneFixture} />
    </TestWrapper>,
  );

describe('<UserActions />', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl(`/entities/${entityId}`);
    mockRouter.query = {
      id: entityId,
    };
    withFrequentNotes(OrgFrequentNoteKind.Trigger, []);
    withPlaybooks();
    withLists();
    withTags();
    withDocuments();
    withData();
    mockRequest({
      method: 'get',
      path: '/org/onboarding_configs',
      statusCode: 200,
      response: {
        data: [
          { id: 'obc_id_123', name: 'Test playbook-1' },
          { id: 'obc_id_456', name: 'Test playbook-2' },
        ],
      },
    });
    mockRequest({
      method: 'get',
      path: `/entities/${entityId}/auth_events`,
      statusCode: 200,
      response: [],
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
          withTimeline(entityWithoutPhoneFixture);
        });

        it('should close the dialog and show a confirmation message for email sent', async () => {
          renderActions(true);

          const button = screen.getByRole('button', {
            name: 'Open actions menu',
          });
          await userEvent.click(button);

          const dropdownItem = screen.getByText('Request more information');
          await userEvent.click(dropdownItem);

          const dialog = screen.getByRole('dialog', {
            name: 'Request more information',
          });
          const playbookOption = screen.getByRole('radio', {
            name: 'Ask user to onboard onto an existing playbook',
          });
          fireEvent.click(playbookOption);
          await waitFor(() => {
            const playbookSelect = screen.getByRole('button', {
              name: 'Select a playbook...',
            });
            expect(playbookSelect).toBeInTheDocument();
          });
          const playbookSelect = screen.getByRole('button', {
            name: 'Select a playbook...',
          });
          await selectEvents.openMenu(playbookSelect);
          const testPlaybookOption = screen.getByRole('option', {
            name: 'Test playbook-2',
          });
          fireEvent.click(testPlaybookOption);
          await waitFor(() => {
            const playbookSelector = screen.queryByRole('button', {
              name: 'Select a playbook...',
            });
            expect(playbookSelector).not.toBeInTheDocument();
          });
          const nextButton = screen.getByRole('button', {
            name: 'Next',
          });
          await userEvent.click(nextButton);

          // We should then render the link on the next page
          await waitFor(() => {
            expect(screen.getByDisplayValue('http://footprint.link/#tok_xxx')).toBeInTheDocument();
          });
          const sendButton = screen.getByRole('button', {
            name: 'Send via email',
          });
          await userEvent.click(sendButton);

          await waitForElementToBeRemoved(dialog);

          await waitFor(() => {
            const successConfirmation = screen.getByText('User will receive an email detailing the next steps shortly');
            expect(successConfirmation).toBeInTheDocument();
          });
        });
      });

      describe('when user has phone', () => {
        beforeEach(() => {
          withEntity(entityWithPhoneFixture);
          withTrigger();
          withTokenSendLink('phone');
          withTimeline();
        });

        it('should close the dialog and show a confirmation message for SMS sent', async () => {
          renderActions();

          const button = screen.getByRole('button', {
            name: 'Open actions menu',
          });
          await userEvent.click(button);

          const dropdownItem = screen.getByText('Request more information');
          await userEvent.click(dropdownItem);

          const dialog = screen.getByRole('dialog', {
            name: 'Request more information',
          });
          const playbookOption = screen.getByRole('radio', {
            name: 'Ask user to onboard onto an existing playbook',
          });
          fireEvent.click(playbookOption);
          await waitFor(() => {
            const playbookSelect = screen.getByRole('button', {
              name: 'Select a playbook...',
            });
            expect(playbookSelect).toBeInTheDocument();
          });
          const playbookSelect = screen.getByRole('button', {
            name: 'Select a playbook...',
          });
          await selectEvents.openMenu(playbookSelect);
          const testPlaybookOption = screen.getByRole('option', {
            name: 'Test playbook-2',
          });
          fireEvent.click(testPlaybookOption);
          await waitFor(() => {
            const playbookSelector = screen.queryByRole('button', {
              name: 'Select a playbook...',
            });
            expect(playbookSelector).not.toBeInTheDocument();
          });

          const nextButton = screen.getByRole('button', {
            name: 'Next',
          });
          await userEvent.click(nextButton);

          // We should then render the link on the next page
          await waitFor(() => {
            expect(screen.getByDisplayValue('http://footprint.link/#tok_xxx')).toBeInTheDocument();
          });
          const sendButton = screen.getByRole('button', {
            name: 'Send via SMS',
          });
          await userEvent.click(sendButton);

          await waitForElementToBeRemoved(dialog);

          await waitFor(() => {
            const successConfirmation = screen.getByText('User will receive an SMS detailing the next steps shortly');
            expect(successConfirmation).toBeInTheDocument();
          });
        });
      });
    });

    describe('when the request to trigger request fails', () => {
      beforeEach(() => {
        withEntity(entityWithPhoneFixture);
        withTimeline();
        withTriggerError();
      });

      it('should show an error message', async () => {
        renderActions();

        const button = screen.getByRole('button', {
          name: 'Open actions menu',
        });
        await userEvent.click(button);

        const dropdownItem = screen.getByText('Request more information');
        await userEvent.click(dropdownItem);

        const playbookOption = screen.getByRole('radio', {
          name: 'Ask user to onboard onto an existing playbook',
        });
        fireEvent.click(playbookOption);
        await waitFor(() => {
          const playbookSelect = screen.getByRole('button', {
            name: 'Select a playbook...',
          });
          expect(playbookSelect).toBeInTheDocument();
        });
        const playbookSelect = screen.getByRole('button', {
          name: 'Select a playbook...',
        });
        await selectEvents.openMenu(playbookSelect);
        const testPlaybookOption = screen.getByRole('option', {
          name: 'Test playbook-2',
        });
        fireEvent.click(testPlaybookOption);
        await waitFor(() => {
          const playbookSelector = screen.queryByRole('button', {
            name: 'Select a playbook...',
          });
          expect(playbookSelector).not.toBeInTheDocument();
        });

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
