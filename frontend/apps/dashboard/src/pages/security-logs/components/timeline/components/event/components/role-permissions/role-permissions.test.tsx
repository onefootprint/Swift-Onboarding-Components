import { customRender, screen } from '@onefootprint/test-utils';
import RolePermissions from './role-permissions';
import { roleFixture, roleWithoutDecryptFixture } from './role-permissions.test.config';

describe('<RolePermissions />', () => {
  it('renders role name and permissions text', () => {
    customRender(<RolePermissions role={roleFixture} />);

    const titleElement = screen.getByText('"Support Role" role permissions');
    expect(titleElement).toBeInTheDocument();
  });

  it('combines multiple decrypt scopes into single "Decrypt data" permission', () => {
    customRender(<RolePermissions role={roleFixture} />);

    const decryptElements = screen.getAllByText('Decrypt data');
    expect(decryptElements).toHaveLength(1);
  });

  it('renders non-decrypt permissions correctly', () => {
    customRender(<RolePermissions role={roleFixture} />);

    const readElement = screen.getByText('Read-only');
    const reviewElement = screen.getByText('Perform manual review');
    const writeElement = screen.getByText('Create and update users');

    expect(readElement).toBeInTheDocument();
    expect(reviewElement).toBeInTheDocument();
    expect(writeElement).toBeInTheDocument();
  });

  it('does not show decrypt permission when role has no decrypt scopes', () => {
    customRender(<RolePermissions role={roleWithoutDecryptFixture} />);

    const decryptElement = screen.queryByText('Decrypt data');
    expect(decryptElement).not.toBeInTheDocument();
  });
});
