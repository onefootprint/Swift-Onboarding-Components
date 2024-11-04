import { customRender, screen } from '@onefootprint/test-utils';
import RolePermissions from './role-permissions';
import { scopesFixture, scopesWithoutDecryptFixture } from './role-permissions.test.config';

describe('<RolePermissions />', () => {
  it('renders role name and permissions text', () => {
    customRender(<RolePermissions name="Support Role" scopes={scopesWithoutDecryptFixture} />);

    const titleElement = screen.getByText('"Support Role" role permissions');
    expect(titleElement).toBeInTheDocument();
  });

  it('combines multiple decrypt scopes into single "Decrypt data" permission', () => {
    customRender(<RolePermissions name="Support Role" scopes={scopesFixture} />);

    const decryptElement = screen.getByText('Decrypt data');
    expect(decryptElement).toBeInTheDocument();
  });

  it('renders non-decrypt permissions correctly', () => {
    customRender(<RolePermissions name="Support Role" scopes={scopesWithoutDecryptFixture} />);

    const readElement = screen.getByText('Read-only');
    const reviewElement = screen.getByText('Perform manual review');

    expect(readElement).toBeInTheDocument();
    expect(reviewElement).toBeInTheDocument();
  });

  it('does not show decrypt permission when role has no decrypt scopes', () => {
    customRender(<RolePermissions name="Basic Role" scopes={scopesWithoutDecryptFixture} />);

    const decryptElement = screen.queryByText('Decrypt data');
    expect(decryptElement).not.toBeInTheDocument();
  });
});
