import {
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import { RoleScope } from '@onefootprint/types';
import React from 'react';
import { asAdminUser, resetUser } from 'src/config/tests';

import Row, { RowProps } from './row';
import roleFixture from './row.test.config';

describe('<Row />', () => {
  beforeEach(() => {
    asAdminUser();
  });

  afterAll(() => {
    resetUser();
  });

  const renderRow = ({ role = roleFixture }: Partial<RowProps>) => {
    customRender(
      <table>
        <tbody>
          <tr>
            <Row role={role} />
          </tr>
        </tbody>
      </table>,
    );
  };

  it('should render the name', () => {
    renderRow({ role: { ...roleFixture, name: 'Admin' } });
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  describe('when is admin', () => {
    it('should render "everything"', () => {
      renderRow({ role: { ...roleFixture, scopes: [RoleScope.admin] } });
      expect(screen.getByText('Everything')).toBeInTheDocument();
    });
  });

  describe('when is not admin', () => {
    it('should render the scopes', () => {
      renderRow({ role: { ...roleFixture, scopes: [RoleScope.read] } });
      expect(screen.getByText('Read-only')).toBeInTheDocument();
    });

    describe('when it has one decrypt field', () => {
      it('should render the scope', () => {
        renderRow({
          role: { ...roleFixture, scopes: [RoleScope.decryptName] },
        });
        const tag = screen.getByText('Decrypt Full name');
        expect(tag).toBeInTheDocument();
      });
    });

    describe('when it has more than one decrypt field', () => {
      it('should render the number of fields and the details in a tooltip', async () => {
        renderRow({
          role: {
            ...roleFixture,
            scopes: [RoleScope.decryptName, RoleScope.decryptEmail],
          },
        });
        const tag = screen.getByText('Decrypt 2 fields');
        expect(tag).toBeInTheDocument();

        await userEvent.hover(tag);
        const tooltipContent = screen.getByText('Full name, Email');
        expect(tooltipContent).toBeInTheDocument();
      });
    });
  });

  describe('when the role is assigned to at least one user', () => {
    it('should show an error message when trying to remove it', async () => {
      renderRow({
        role: { ...roleFixture, numActiveUsers: 1, name: 'Customer Support' },
      });

      const actionButton = screen.getByRole('button', {
        name: 'Open actions for role Customer Support',
      });
      await userEvent.click(actionButton);

      const removeButton = screen.getByText('Remove role');
      await userEvent.click(removeButton);

      await waitFor(() => {
        const errorMessage = screen.getByText("Role can't be removed");
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });
});
