import {
  createClipboardSpy,
  customRender,
  fireEvent,
  mockRequest,
  mockRouter,
  screen,
  selectEvents,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import { ContactInfoKind, OrgFrequentNoteKind } from '@onefootprint/types';
import {
  withFrequentNotes,
  withPlaybooks,
} from 'src/components/frequent-notes-text-area/frequent-notes-text-area.test.config';

import type { RequestMoreInfoDialogProps } from './request-more-info-dialog';
import RequestMoreInfoDialog from './request-more-info-dialog';
import {
  entityFixture,
  entityFixtureWithIncompleteOnboarding,
  withEntity,
  withEntityWithIncompleteOnboarding,
} from './request-more-info.test.config';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

const defaultOptions = {
  open: true,
  onClose: jest.fn(),
};

const renderDialog = ({
  open = defaultOptions.open,
  onClose = defaultOptions.onClose,
}: Partial<RequestMoreInfoDialogProps>) => customRender(<RequestMoreInfoDialog open={open} onClose={onClose} />);

describe('<RequestMoreInfoDialog />', () => {
  beforeEach(() => {
    withEntity(entityFixture.id);
    withPlaybooks();
    withFrequentNotes(OrgFrequentNoteKind.Trigger, []);
    mockRouter.setCurrentUrl(`/entities/${entityFixture.id}`);
    mockRouter.query = {
      id: entityFixture.id,
    };
  });

  it('should call close callback', async () => {
    const onCloseMockFn = jest.fn();
    renderDialog({ onClose: onCloseMockFn });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await userEvent.click(cancelButton);

    expect(onCloseMockFn).toHaveBeenCalled();
  });

  it('should show error when attempt to submit without selecting document option', async () => {
    renderDialog({ onClose: jest.fn() });
    const documentOption = screen.getByRole('radio', {
      name: 'Ask user to upload documents',
    });
    fireEvent.click(documentOption);
    await waitFor(() => {
      expect(documentOption).toBeChecked();
    });
    const nextButton = screen.getByRole('button', {
      name: 'Next',
    });
    await userEvent.click(nextButton);
    await waitFor(() => {
      const documentWarning = screen.getByText('You must select a document type');
      expect(documentWarning).toBeInTheDocument();
    });
    const onboardingOption = screen.getByRole('radio', {
      name: 'Ask user to onboard onto an existing playbook',
    });
    fireEvent.click(onboardingOption);
    await waitFor(() => {
      expect(onboardingOption).toBeChecked();
    });
    await userEvent.click(nextButton);
    await waitFor(() => {
      const playbookWarning = screen.getByText('You must select a playbook');
      expect(playbookWarning).toBeInTheDocument();
    });
  });

  describe('Incomplete onboarding', () => {
    beforeEach(() => {
      mockRouter.setCurrentUrl(`/entities/${entityFixtureWithIncompleteOnboarding.id}`);
      mockRouter.query = {
        id: entityFixtureWithIncompleteOnboarding.id,
      };
    });

    beforeEach(() => {
      withEntityWithIncompleteOnboarding(entityFixtureWithIncompleteOnboarding.id);
      withPlaybooks();
      withFrequentNotes(OrgFrequentNoteKind.Trigger, []);
    });

    it('document option is disabled and onboard option is selected by default', async () => {
      renderDialog({ onClose: jest.fn() });
      const documentOption = screen.getByRole('radio', {
        name: 'Ask user to upload documents',
      });
      expect(documentOption).toBeDisabled();
      const nextButton = screen.getByRole('button', {
        name: 'Next',
      });
      await userEvent.click(nextButton);
      await waitFor(() => {
        const playbookWarning = screen.getByText('You must select a playbook');
        expect(playbookWarning).toBeInTheDocument();
      });
    });
  });

  describe('Manual review clearing option', () => {
    beforeEach(() => {
      mockRouter.setCurrentUrl(`/entities/${entityFixture.id}`);
      mockRouter.query = {
        id: entityFixture.id,
      };
    });

    beforeEach(() => {
      withPlaybooks();
      withFrequentNotes(OrgFrequentNoteKind.Trigger, []);
    });

    it('no option when user doesnt require manual review', async () => {
      withEntity(entityFixture.id, false);
      renderDialog({ onClose: jest.fn() });
      expect(screen.queryByText('Clear manual review after request')).not.toBeInTheDocument();
    });

    it('has option when user requires manual review', async () => {
      withEntity(entityFixture.id, true);
      renderDialog({ onClose: jest.fn() });
      await waitFor(() => {
        expect(screen.getByText('Clear manual review after request')).toBeInTheDocument();
      });
    });
  });

  describe('on link page', () => {
    beforeEach(() => {
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
        method: 'post',
        path: `/entities/${entityFixture.id}/actions`,
        statusCode: 200,
        response: [
          {
            kind: 'trigger',
            link: 'http://footprint.link/#tok_xxx',
          },
        ],
      });
    });

    it('should show link after submitting onboard request. can copy to close', async () => {
      const { writeTestMockFn } = createClipboardSpy();
      const onCloseMockFn = jest.fn();

      renderDialog({ onClose: onCloseMockFn });
      const playbookOption = screen.getByRole('radio', {
        name: 'Ask user to onboard onto an existing playbook',
      });
      fireEvent.click(playbookOption);
      await waitFor(() => {
        const playbookSelect = screen.getByRole('button', {
          name: 'Test playbook-1',
        });
        expect(playbookSelect).toBeInTheDocument();
      });
      const playbookSelect = screen.getByRole('button', {
        name: 'Test playbook-1',
      });
      await selectEvents.openMenu(playbookSelect);
      const testPlaybookOption = screen.getByRole('option', {
        name: 'Test playbook-2',
      });
      fireEvent.click(testPlaybookOption);
      await waitFor(() => {
        const playbookSelector = screen.queryByRole('button', {
          name: 'Test playbook-1',
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

      // Can copy the link using the button
      const copyButton = screen.getByRole('button', { name: 'Copy link' });
      await userEvent.click(copyButton);
      await waitFor(() => {
        expect(writeTestMockFn).toHaveBeenCalledWith('http://footprint.link/#tok_xxx');
      });
      expect(onCloseMockFn).toHaveBeenCalled();
      expect(true).toBe(true);
    });

    it('should show link after submitting multiple documents request. can copy to close', async () => {
      const { writeTestMockFn } = createClipboardSpy();
      const onCloseMockFn = jest.fn();

      renderDialog({ onClose: onCloseMockFn });
      const documentOption = screen.getByRole('radio', {
        name: 'Ask user to upload documents',
      });
      fireEvent.click(documentOption);
      await waitFor(() => {
        expect(documentOption).toBeChecked();
      });
      const idDocumentOption = screen.getByRole('checkbox', {
        name: 'Upload ID photo',
      });
      const proofOfSsnOption = screen.getByRole('checkbox', {
        name: 'Proof of SSN',
      });
      const proofOfAddressOption = screen.getByRole('checkbox', {
        name: 'Proof of address',
      });
      const customDocumentOption = screen.getByRole('checkbox', {
        name: 'Custom document',
      });
      await userEvent.click(idDocumentOption);
      await waitFor(() => {
        const selfieCheckbox = screen.getByRole('checkbox', {
          name: 'Request a selfie',
        });
        expect(selfieCheckbox).toBeInTheDocument();
      });
      await userEvent.click(proofOfSsnOption);
      await userEvent.click(proofOfAddressOption);
      await userEvent.click(customDocumentOption);
      await waitFor(() => {
        const customDocumentName = screen.getByRole('textbox', {
          name: 'Document name',
        });
        expect(customDocumentName).toBeInTheDocument();
      });
      const customDocumentName = screen.getByRole('textbox', {
        name: 'Document name',
      });
      const customDocumentIdentifier = screen.getByRole('textbox', {
        name: 'Identifier',
      });
      await userEvent.type(customDocumentName, 'Custom document name');
      await userEvent.type(customDocumentIdentifier, 'identifier');
      const nextButton = screen.getByRole('button', {
        name: 'Next',
      });
      await userEvent.click(nextButton);

      // We should then render the link on the next page
      await waitFor(() => {
        expect(screen.getByDisplayValue('http://footprint.link/#tok_xxx')).toBeInTheDocument();
      });

      // Can copy the link using the button
      const copyButton = screen.getByRole('button', { name: 'Copy link' });
      await userEvent.click(copyButton);
      await waitFor(() => {
        expect(writeTestMockFn).toHaveBeenCalledWith('http://footprint.link/#tok_xxx');
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
      const playbookOption = screen.getByRole('radio', {
        name: 'Ask user to onboard onto an existing playbook',
      });
      fireEvent.click(playbookOption);
      await waitFor(() => {
        const playbookSelect = screen.getByRole('button', {
          name: 'Test playbook-1',
        });
        expect(playbookSelect).toBeInTheDocument();
      });
      const playbookSelect = screen.getByRole('button', {
        name: 'Test playbook-1',
      });
      await selectEvents.openMenu(playbookSelect);
      const testPlaybookOption = screen.getByRole('option', {
        name: 'Test playbook-2',
      });
      fireEvent.click(testPlaybookOption);
      await waitFor(() => {
        const playbookSelector = screen.queryByRole('button', {
          name: 'Test playbook-1',
        });
        expect(playbookSelector).not.toBeInTheDocument();
      });
      const nextButton = screen.getByRole('button', {
        name: 'Next',
      });
      await userEvent.click(nextButton);
      await waitFor(() => {
        expect(screen.getByDisplayValue('http://footprint.link/#tok_xxx')).toBeInTheDocument();
      });

      const sendButton = screen.getByRole('button', {
        name: 'Send via email',
      });
      await userEvent.click(sendButton);
      await waitFor(() => {
        expect(screen.getByText('User will receive an email detailing the next steps shortly')).toBeInTheDocument();
      });
    });
  });
});
