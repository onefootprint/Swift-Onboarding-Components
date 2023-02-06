import {
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import Invite, { InviteProps } from './invite';

describe('<Invite />', () => {
  const renderInvite = ({
    id = 'invite-form',
    onComplete = jest.fn(),
  }: Partial<InviteProps>) =>
    customRender(
      <>
        <div id="onboarding-cta-portal" />
        <Invite id={id} onComplete={onComplete} />
      </>,
    );

  it('should show one invite field with the member role as default option', () => {
    renderInvite({});

    const emailFields = screen.getAllByPlaceholderText('jane.doe@acme.com');
    expect(emailFields).toHaveLength(1);

    const roleField = screen.getByRole('button', { name: 'Member' });
    expect(roleField).toBeInTheDocument();
  });

  describe('when clicking on the add more button', () => {
    it('should add a new invite field', async () => {
      renderInvite({});
      const addMoreButton = screen.getByRole('button', { name: 'Add more' });
      await userEvent.click(addMoreButton);
      const emailFields = screen.getAllByPlaceholderText('jane.doe@acme.com');
      await waitFor(() => {
        expect(emailFields).toHaveLength(2);
      });
    });
  });

  describe('when submitting the form', () => {
    it('should show an error when the first input is not filled correctly', async () => {
      renderInvite({});
      const submitButton = screen.getByRole('button', { name: 'Complete' });
      await userEvent.click(submitButton);
      const error = await screen.findByText(
        'Please complete the fields above.',
      );
      expect(error).toBeInTheDocument();
    });

    it('should call onComplete when the form is valid', async () => {
      const onComplete = jest.fn();
      renderInvite({ onComplete });
      const emailField = screen.getByPlaceholderText('jane.doe@acme.com');
      await userEvent.type(emailField, 'jane.doe@acme.com');
      const submitButton = screen.getByRole('button', { name: 'Complete' });
      await userEvent.click(submitButton);
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });
    });
  });
});
