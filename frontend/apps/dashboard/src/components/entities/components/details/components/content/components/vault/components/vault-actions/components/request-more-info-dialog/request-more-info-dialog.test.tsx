import {
  createClipboardSpy,
  createUseRouterSpy,
  customRender,
  fireEvent,
  mockRequest,
  screen,
  selectEvents,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import { ContactInfoKind, OrgFrequentNoteKind } from '@onefootprint/types';
import React from 'react';
import {
  withFrequentNotes,
  withPlaybooks,
} from 'src/components/frequent-notes-text-area/frequent-notes-text-area.test.config';

import {
  entityFixture,
  entityFixtureWithIncompleteOnboarding,
  withEntity,
  withEntityWithIncompleteOnboarding,
} from './request-more-info.test.config';
import type { RequestMoreInfoDialogProps } from './request-more-info-dialog';
import RequestMoreInfoDialog from './request-more-info-dialog';

const defaultOptions = {
  open: true,
  onClose: jest.fn(),
};

const useRouterSpy = createUseRouterSpy();

const renderDialog = ({
  open = defaultOptions.open,
  onClose = defaultOptions.onClose,
}: Partial<RequestMoreInfoDialogProps>) =>
  customRender(<RequestMoreInfoDialog open={open} onClose={onClose} />);

describe('<RequestMoreInfoDialog />', () => {
  beforeEach(() => {
    withEntity(entityFixture.id);
    withPlaybooks();
    withFrequentNotes(OrgFrequentNoteKind.Trigger, []);
    useRouterSpy({
      pathname: `/entities/${entityFixture.id}`,
      query: {
        id: entityFixture.id,
      },
    });
  });

  it('should call close callback', async () => {
    const onCloseMockFn = jest.fn();
    renderDialog({ onClose: onCloseMockFn });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await userEvent.click(cancelButton);

    expect(onCloseMockFn).toHaveBeenCalled();
  });

  it('shows error when attempt to submit without selecting option', async () => {
    renderDialog({ onClose: jest.fn() });

    const nextButton = screen.getByRole('button', {
      name: 'Next',
    });
    await userEvent.click(nextButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          'You need to select an option before requesting more information from a user.',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Incomplete onboarding', () => {
    beforeEach(() => {
      withEntityWithIncompleteOnboarding(
        entityFixtureWithIncompleteOnboarding.id,
      );
      withPlaybooks();
      withFrequentNotes(OrgFrequentNoteKind.Trigger, []);
      useRouterSpy({
        pathname: `/entities/${entityFixtureWithIncompleteOnboarding.id}`,
        query: {
          id: entityFixtureWithIncompleteOnboarding.id,
        },
      });
    });

    it('shows error for upload id photo request', async () => {
      renderDialog({ onClose: jest.fn() });

      const kindSelect = screen.getByRole('button', { name: 'Select option' });
      await selectEvents.openMenu(kindSelect);
      await waitFor(() => {
        const idPhotoOption = screen.getByRole('option', {
          name: 'Upload ID photo',
        });
        expect(idPhotoOption).toBeInTheDocument();
      });
      const idPhotoOption = screen.getByRole('option', {
        name: 'Upload ID photo',
      });
      fireEvent.click(idPhotoOption);
      await waitFor(() => {
        const requestSelfieToggle = screen.getByRole('switch', {
          name: 'Request a selfie',
        });
        expect(requestSelfieToggle).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', {
        name: 'Next',
      });
      await userEvent.click(nextButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(
          'Cannot request more info from this user until they onboard onto a playbook',
        );
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it('shows error for proof of ssn request', async () => {
      renderDialog({ onClose: jest.fn() });

      const kindSelect = screen.getByRole('button', { name: 'Select option' });
      await selectEvents.openMenu(kindSelect);
      await waitFor(() => {
        const proofOfSsnOption = screen.getByRole('option', {
          name: 'Proof of SSN and ID photo',
        });
        expect(proofOfSsnOption).toBeInTheDocument();
      });
      const proofOfSsnOption = screen.getByRole('option', {
        name: 'Proof of SSN and ID photo',
      });
      fireEvent.click(proofOfSsnOption);
      await waitFor(() => {
        const kindSelector = screen.queryByRole('button', {
          name: 'Select option',
        });
        expect(kindSelector).not.toBeInTheDocument();
      });
      const nextButton = screen.getByRole('button', {
        name: 'Next',
      });
      await userEvent.click(nextButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(
          'Cannot request more info from this user until they onboard onto a playbook',
        );
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it('shows error for proof of address request', async () => {
      renderDialog({ onClose: jest.fn() });

      const kindSelect = screen.getByRole('button', { name: 'Select option' });
      await selectEvents.openMenu(kindSelect);
      await waitFor(() => {
        const proofOfAddressOption = screen.getByRole('option', {
          name: 'Proof of address',
        });
        expect(proofOfAddressOption).toBeInTheDocument();
      });
      const proofOfAddressOption = screen.getByRole('option', {
        name: 'Proof of address',
      });
      fireEvent.click(proofOfAddressOption);
      await waitFor(() => {
        const kindSelector = screen.queryByRole('button', {
          name: 'Select option',
        });
        expect(kindSelector).not.toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', {
        name: 'Next',
      });
      await userEvent.click(nextButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(
          'Cannot request more info from this user until they onboard onto a playbook',
        );
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it("doesn't show error for Onboard to a playbook request", async () => {
      mockRequest({
        method: 'get',
        path: `/org/onboarding_configs`,
        statusCode: 200,
        response: {
          data: [
            { id: 'obc_id_123', name: 'Test playbook-1' },
            { id: 'obc_id_456', name: 'Test playbook-2' },
          ],
        },
      });
      mockRequest({
        method: 'post',
        path: `/entities/${entityFixture.id}/triggers`,
        statusCode: 200,
        response: {
          link: 'http://footprint.link/#tok_xxx',
        },
      });
      renderDialog({ onClose: jest.fn() });

      const kindSelect = screen.getByRole('button', { name: 'Select option' });
      await selectEvents.openMenu(kindSelect);
      await waitFor(() => {
        const playbookOption = screen.getByRole('option', {
          name: 'Onboard onto a playbook',
        });
        expect(playbookOption).toBeInTheDocument();
      });
      const playbookOption = screen.getByRole('option', {
        name: 'Onboard onto a playbook',
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
        expect(
          screen.getByDisplayValue('http://footprint.link/#tok_xxx'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('on link page', () => {
    beforeEach(() => {
      mockRequest({
        method: 'get',
        path: `/org/onboarding_configs`,
        statusCode: 200,
        response: {
          data: [
            { id: 'obc_id_123', name: 'Test playbook-1' },
            { id: 'obc_id_456', name: 'Test playbook-2' },
          ],
        },
      });
      mockRequest({
        method: 'post',
        path: `/entities/${entityFixture.id}/triggers`,
        statusCode: 200,
        response: {
          link: 'http://footprint.link/#tok_xxx',
        },
      });
    });

    it('shows link after submitting options. can copy to close', async () => {
      const { writeTestMockFn } = createClipboardSpy();
      const onCloseMockFn = jest.fn();

      renderDialog({ onClose: onCloseMockFn });
      const kindSelect = screen.getByRole('button', { name: 'Select option' });
      await selectEvents.openMenu(kindSelect);
      await waitFor(() => {
        const playbookOption = screen.getByRole('option', {
          name: 'Onboard onto a playbook',
        });
        expect(playbookOption).toBeInTheDocument();
      });
      const playbookOption = screen.getByRole('option', {
        name: 'Onboard onto a playbook',
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
        expect(
          screen.getByDisplayValue('http://footprint.link/#tok_xxx'),
        ).toBeInTheDocument();
      });

      // Can copy the link using the button
      const copyButton = screen.getByRole('button', { name: 'Copy link' });
      await userEvent.click(copyButton);
      await waitFor(() => {
        expect(writeTestMockFn).toHaveBeenCalledWith(
          'http://footprint.link/#tok_xxx',
        );
      });
      expect(onCloseMockFn).toHaveBeenCalled();
    });

    it('can send link', async () => {
      mockRequest({
        method: 'post',
        path: `/entities/${entityFixture.id}/token`,
        statusCode: 200,
        response: {
          deliveryMethod: ContactInfoKind.email,
        },
      });

      renderDialog({ onClose: jest.fn() });
      const kindSelect = screen.getByRole('button', { name: 'Select option' });
      await selectEvents.openMenu(kindSelect);
      await waitFor(() => {
        const playbookOption = screen.getByRole('option', {
          name: 'Onboard onto a playbook',
        });
        expect(playbookOption).toBeInTheDocument();
      });
      const playbookOption = screen.getByRole('option', {
        name: 'Onboard onto a playbook',
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
        expect(
          screen.getByDisplayValue('http://footprint.link/#tok_xxx'),
        ).toBeInTheDocument();
      });

      const sendButton = screen.getByRole('button', {
        name: 'Send via email',
      });
      await userEvent.click(sendButton);
      await waitFor(() => {
        expect(
          screen.getByText(
            'User will receive an email detailing the next steps shortly',
          ),
        ).toBeInTheDocument();
      });
    });
  });
});
