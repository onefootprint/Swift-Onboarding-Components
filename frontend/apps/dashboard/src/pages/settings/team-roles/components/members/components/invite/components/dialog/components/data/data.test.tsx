import { customRender, screen, userEvent } from '@onefootprint/test-utils';

import type { DataProps } from './data';
import Data from './data';

describe('<Data />', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'scrollTo', {
      value: jest.fn(),
      writable: true,
    });
  });
  const defaultRoles = [
    {
      label: 'Admin',
      value: 'org_role_abc1234',
    },
    {
      label: 'Member',
      value: 'org_role_abc12345',
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
        roleId: 'org_role_abc1234',
        omitEmailInvite: false,
      },
    ]);
  });
});
