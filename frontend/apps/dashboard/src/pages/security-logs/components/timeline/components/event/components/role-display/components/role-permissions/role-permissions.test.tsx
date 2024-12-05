import { getTenantScope } from '@onefootprint/fixtures/dashboard';
import { customRender, screen } from '@onefootprint/test-utils';
import RolePermissions from './role-permissions';

describe('<RolePermissions />', () => {
  it('combines multiple decrypt scopes into single "Decrypt data" permission', async () => {
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

    const decryptElement = await screen.findByText('Decrypt data');
    expect(decryptElement).toBeInTheDocument();
  });

  it('renders non-decrypt permissions correctly', async () => {
    customRender(
      <RolePermissions
        name="Support Role"
        scopes={[getTenantScope({ kind: 'read' }), getTenantScope({ kind: 'manual_review' })]}
      />,
    );

    const readElement = await screen.findByText('Read-only');
    const reviewElement = await screen.findByText('Perform manual review');

    expect(readElement).toBeInTheDocument();
    expect(reviewElement).toBeInTheDocument();
  });

  it('does not show decrypt permission when role has no decrypt scopes', async () => {
    customRender(<RolePermissions name="Basic Role" scopes={[getTenantScope({ kind: 'read' })]} />);

    const decryptElement = screen.queryByText('Decrypt data');
    expect(decryptElement).not.toBeInTheDocument();
  });
});
