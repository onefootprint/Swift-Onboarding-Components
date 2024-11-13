import { getTenantScope } from '@onefootprint/fixtures/dashboard';
import { customRender, screen } from '@onefootprint/test-utils';
import RolePermissions from './role-permissions';

describe('<RolePermissions />', () => {
  it('renders role name and permissions text', () => {
    customRender(<RolePermissions name="Support Role" scopes={[getTenantScope({ kind: 'read' })]} />);

    const titleElement = screen.getByText('"Support Role" role permissions');
    expect(titleElement).toBeInTheDocument();
  });

  it('combines multiple decrypt scopes into single "Decrypt data" permission', () => {
    customRender(
      <RolePermissions
        name="Support Role"
        scopes={[
          getTenantScope({ kind: 'read' }),
          getTenantScope({ kind: 'decrypt', data: 'name' }),
          getTenantScope({ kind: 'decrypt', data: 'email' }),
        ]}
      />,
    );

    const decryptElement = screen.getByText('Decrypt data');
    expect(decryptElement).toBeInTheDocument();
  });

  it('renders non-decrypt permissions correctly', () => {
    customRender(
      <RolePermissions
        name="Support Role"
        scopes={[getTenantScope({ kind: 'read' }), getTenantScope({ kind: 'manual_review' })]}
      />,
    );

    const readElement = screen.getByText('Read-only');
    const reviewElement = screen.getByText('Perform manual review');

    expect(readElement).toBeInTheDocument();
    expect(reviewElement).toBeInTheDocument();
  });

  it('does not show decrypt permission when role has no decrypt scopes', () => {
    customRender(<RolePermissions name="Basic Role" scopes={[getTenantScope({ kind: 'read' })]} />);

    const decryptElement = screen.queryByText('Decrypt data');
    expect(decryptElement).not.toBeInTheDocument();
  });
});
