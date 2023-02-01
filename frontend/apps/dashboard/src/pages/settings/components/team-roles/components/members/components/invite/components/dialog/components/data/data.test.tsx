import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import Data, { DataProps } from './data';

describe('<Data />', () => {
  const defaultRoles = [
    {
      label: 'Admin',
      value: 'admin',
    },
    {
      label: 'Member',
      value: 'read-only',
    },
  ];
  const renderData = ({
    defaultRole = defaultRoles[0],
    onSubmit = jest.fn(),
    roles = defaultRoles,
  }: Partial<DataProps>) =>
    customRender(
      <div>
        <Data defaultRole={defaultRole} onSubmit={onSubmit} roles={roles} />
        <button form="members-invite-form" type="submit">
          Invite
        </button>
      </div>,
    );

  it('should not send any empty email', async () => {
    const onSubmit = jest.fn();
    renderData({ onSubmit });

    const emailField = screen.getByLabelText('Email address');
    await userEvent.type(emailField, 'johnny@acme.com');

    const addMoreButton = screen.getByRole('button', { name: 'Add more' });
    await userEvent.click(addMoreButton);

    const submitButton = screen.getByRole('button', { name: 'Invite' });
    await userEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith([
      {
        email: 'johnny@acme.com',
        redirectUrl: 'http://localhost/auth',
        roleId: 'admin',
      },
    ]);
  });
});
