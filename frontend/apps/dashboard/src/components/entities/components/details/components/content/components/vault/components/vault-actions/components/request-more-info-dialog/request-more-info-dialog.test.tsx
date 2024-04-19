import {
  createClipboardSpy,
  createUseRouterSpy,
  customRender,
  mockRequest,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import { ContactInfoKind, OrgFrequentNoteKind } from '@onefootprint/types';
import React from 'react';
import {
  withFrequentNotes,
  withPlaybooks,
} from 'src/components/frequent-notes-text-area/frequent-notes-text-area.test.config';

import { entityFixture, withEntity } from './request-more-info.test.config';
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

  describe('on link page', () => {
    beforeEach(() => {
      mockRequest({
        method: 'get',
        path: `/org/onboarding_configs`,
        statusCode: 200,
        response: {
          data: [{ id: 'obc_id_123', name: 'Test playbook' }],
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

      const option = screen.getByRole('radio', {
        name: 'Onboard onto playbook',
      });
      await userEvent.click(option);
      await waitFor(() => {
        expect(screen.getByText('Test playbook')).toBeInTheDocument();
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
      const option = screen.getByRole('radio', {
        name: 'Onboard onto playbook',
      });
      await userEvent.click(option);
      await waitFor(() => {
        expect(screen.getByText('Test playbook')).toBeInTheDocument();
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
