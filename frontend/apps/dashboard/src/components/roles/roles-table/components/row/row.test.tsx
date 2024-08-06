import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { CollectedKycDataOption, RoleKind, RoleScopeKind } from '@onefootprint/types';
import { asAdminUser, resetUser } from 'src/config/tests';
import { withProxyConfigs } from 'src/pages/proxy-configs/proxy-config.test.config';

import type { RowProps } from './row';
import Row from './row';
import roleFixture from './row.test.config';

describe('<Row />', () => {
  beforeEach(() => {
    asAdminUser();
    withProxyConfigs();
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

  it('should render the active API users', () => {
    renderRow({
      role: { ...roleFixture, numActiveApiKeys: 1234, kind: RoleKind.apiKey },
    });
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('should render the active dashboard users', () => {
    renderRow({ role: { ...roleFixture, numActiveUsers: 4321 } });
    expect(screen.getByText('4321')).toBeInTheDocument();
  });

  it('should render the name', () => {
    renderRow({ role: { ...roleFixture, name: 'Admin' } });
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  describe('when is admin', () => {
    it('should render "everything"', () => {
      renderRow({
        role: { ...roleFixture, scopes: [{ kind: RoleScopeKind.admin }] },
      });
      expect(screen.getByText('Everything')).toBeInTheDocument();
    });
  });

  describe('when is not admin', () => {
    it('should render the scopes', () => {
      renderRow({
        role: { ...roleFixture, scopes: [{ kind: RoleScopeKind.read }] },
      });
      expect(screen.getByText('Read-only')).toBeInTheDocument();
    });

    describe('when it has one decrypt field', () => {
      it('should render the scope', () => {
        renderRow({
          role: {
            ...roleFixture,
            scopes: [
              {
                kind: RoleScopeKind.decrypt,
                data: CollectedKycDataOption.name,
              },
            ],
          },
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
            scopes: [
              {
                kind: RoleScopeKind.decrypt,
                data: CollectedKycDataOption.name,
              },
              {
                kind: RoleScopeKind.decrypt,
                data: CollectedKycDataOption.email,
              },
            ],
          },
        });
        const tag = screen.getByText('Decrypt 2 fields');
        expect(tag).toBeInTheDocument();

        await userEvent.hover(tag);
        await waitFor(() => {
          const tooltip = screen.getByRole('tooltip', {
            name: 'Full name, Email',
          });
          expect(tooltip).toBeInTheDocument();
        });
      });
    });
  });

  describe('when the role is assigned to at least one user', () => {
    it('should show an error message when trying to delete it', async () => {
      renderRow({
        role: { ...roleFixture, numActiveUsers: 1, name: 'Customer Support' },
      });

      const actionButton = screen.getByRole('button', {
        name: 'Open actions for role Customer Support',
      });
      await userEvent.click(actionButton);

      const deleteButton = screen.getByText('Delete role');
      await userEvent.click(deleteButton);

      await waitFor(() => {
        const errorMessage = screen.getByText("Role can't be deleted");
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });
});
