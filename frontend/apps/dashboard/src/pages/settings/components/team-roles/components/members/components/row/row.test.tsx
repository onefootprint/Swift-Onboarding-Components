import {
  createUseRouterSpy,
  customRender,
  screen,
  userEvent,
  waitFor,
  within,
} from '@onefootprint/test-utils';
import React from 'react';

import Row, { RowProps } from './row';
import {
  memberFixture,
  roleToSelectOnEdit,
  withEditMember,
  withOrgRoles,
} from './row.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<Row />', () => {
  beforeEach(() => {
    withOrgRoles();
    useRouterSpy({
      pathname: '/settings',
      query: {
        tab: 'members',
      },
    });
  });

  const renderRow = ({ member = memberFixture }: Partial<RowProps>) =>
    customRender(
      <table>
        <tbody>
          <tr>
            <Row member={member} />
          </tr>
        </tbody>
      </table>,
    );

  it('should render the name', () => {
    renderRow({
      member: { ...memberFixture, firstName: 'Jane', lastName: 'Doe' },
    });
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('should render the email', () => {
    renderRow({
      member: { ...memberFixture, email: 'jane.doe@acme.com' },
    });
    expect(screen.getByText('jane.doe@acme.com')).toBeInTheDocument();
  });

  it('should render the last active time', () => {
    renderRow({
      member: { ...memberFixture, lastLoginAt: '3 hours ago' },
    });
    expect(screen.getByText('3 hours ago')).toBeInTheDocument();
  });

  it('should render the role', () => {
    renderRow({
      member: { ...memberFixture, roleName: 'Admin' },
    });
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  describe('when the name is not present', () => {
    it('should render a dash', () => {
      renderRow({
        member: { ...memberFixture, firstName: null, lastName: null },
      });
      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });

  describe('when invite is pending', () => {
    it('should render the pending invite badge', () => {
      renderRow({
        member: { ...memberFixture, lastLoginAt: null },
      });
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });

  describe('when clicking on the role button', () => {
    beforeEach(() => {
      withEditMember(memberFixture, roleToSelectOnEdit);
    });

    it('should display the list of roles with a description', async () => {
      renderRow({});

      const currentRole = screen.getByText('Admin');
      expect(currentRole).toBeInTheDocument();

      const roleButton = screen.getByRole('combobox', {
        name: `Change ${memberFixture.email} role`,
      });
      await userEvent.click(roleButton);

      await waitFor(() => {
        const memberOption = screen.getByRole('option', {
          name: 'Member',
        });
        expect(memberOption).toBeInTheDocument();
      });

      const memberOption = screen.getByRole('option', {
        name: 'Member',
      });
      const description = within(memberOption).getByText('Read-only');
      expect(description).toBeInTheDocument();
      await userEvent.click(memberOption);

      const newRole = screen.getByText('Member');
      expect(newRole).toBeInTheDocument();
    });
  });
});
