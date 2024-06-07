import { createUseRouterSpy, customRender, screen, userEvent, waitFor, within } from '@onefootprint/test-utils';
import React from 'react';

import type { RowProps } from './row';
import Row from './row';
import {
  memberFixture,
  roleToSelectOnEdit,
  withCurrentUserDifferentFromMember,
  withCurrentUserSameAsMember,
  withEditMember,
  withRoles,
} from './row.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<Row />', () => {
  beforeEach(() => {
    withCurrentUserDifferentFromMember();
    withRoles();
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

  it('should show the name', () => {
    renderRow({
      member: { ...memberFixture, firstName: 'Jane', lastName: 'Doe' },
    });
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('should show the email', () => {
    renderRow({
      member: { ...memberFixture, email: 'jane.doe@acme.com' },
    });
    expect(screen.getByText('jane.doe@acme.com')).toBeInTheDocument();
  });

  it('should show the last active time', () => {
    renderRow({
      member: { ...memberFixture, rolebinding: { lastLoginAt: '3 hours ago' } },
    });
    expect(screen.getByText('3 hours ago')).toBeInTheDocument();
  });

  it('should show the role', () => {
    renderRow({
      member: {
        ...memberFixture,
        role: { ...memberFixture.role, name: 'Admin' },
      },
    });
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  describe('when the name is not present', () => {
    it('should show a dash', () => {
      renderRow({
        member: { ...memberFixture, firstName: null, lastName: null },
      });
      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });

  describe('when invite is pending', () => {
    it('should show the pending invite badge', () => {
      renderRow({
        member: { ...memberFixture, rolebinding: { lastLoginAt: null } },
      });
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });

  describe('when clicking on the edit role button', () => {
    beforeEach(() => {
      withEditMember(memberFixture, roleToSelectOnEdit);
    });

    it('should display the list of roles with a description', async () => {
      renderRow({});

      const currentRole = screen.getByText('Admin');
      expect(currentRole).toBeInTheDocument();

      const triggerButton = screen.getByRole('combobox', {
        name: `Change ${memberFixture.email} role`,
      });
      await userEvent.click(triggerButton);

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

  describe('when the current user is the same as the member', () => {
    beforeEach(() => {
      withCurrentUserSameAsMember();
    });

    it('should hide the edit role button', () => {
      renderRow({});

      const triggerButton = screen.queryByRole('combobox', {
        name: `Change ${memberFixture.email} role`,
      });
      expect(triggerButton).not.toBeInTheDocument();
    });

    it('should hide the actions menu', () => {
      renderRow({});

      const actionsMenu = screen.queryByRole('button', {
        name: `Open actions for member ${memberFixture.email}.com`,
      });
      expect(actionsMenu).not.toBeInTheDocument();
    });
  });
});
