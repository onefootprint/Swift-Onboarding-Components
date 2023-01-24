import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import Row, { RowProps } from './row';
import memberFixture from './row.test.config';

describe('<Row />', () => {
  const renderRow = ({
    createdAt = memberFixture.createdAt,
    email = memberFixture.email,
    firstName = memberFixture.firstName,
    id = memberFixture.id,
    lastLoginAt = memberFixture.lastLoginAt,
    lastName = memberFixture.lastName,
    roleId = memberFixture.roleId,
    roleName = memberFixture.roleName,
  }: Partial<RowProps>) => {
    customRender(
      <table>
        <tbody>
          <tr>
            <Row
              createdAt={createdAt}
              email={email}
              firstName={firstName}
              lastName={lastName}
              id={id}
              roleId={roleId}
              roleName={roleName}
              lastLoginAt={lastLoginAt}
            />
          </tr>
        </tbody>
      </table>,
    );
  };

  it('should render the name', () => {
    renderRow({ firstName: 'Jane', lastName: 'Doe' });
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('should render the email', () => {
    renderRow({ email: 'jane.doe@acme.com' });
    expect(screen.getByText('jane.doe@acme.com')).toBeInTheDocument();
  });

  it('should render the last active time', () => {
    renderRow({ lastLoginAt: '3 hours ago' });
    expect(screen.getByText('3 hours ago')).toBeInTheDocument();
  });

  it('should render the role', () => {
    renderRow({ roleName: 'Admin' });
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  describe('when the name is not present', () => {
    it('should render a dash', () => {
      renderRow({ firstName: null, lastName: null });
      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });

  describe('when invite is pending', () => {
    it('should render the pending invite badge', () => {
      renderRow({ lastLoginAt: null });
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });
});
