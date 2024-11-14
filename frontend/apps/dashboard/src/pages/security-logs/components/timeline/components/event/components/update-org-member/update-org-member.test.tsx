import { getAuditEventDetail, getOrganizationRole } from '@onefootprint/fixtures/dashboard';
import { customRender, screen } from '@onefootprint/test-utils';
import UpdateOrgMember from './update-org-member';

describe('<UpdateOrgMember />', () => {
  it('renders member name and role change when name is provided', () => {
    customRender(
      <UpdateOrgMember
        detail={getAuditEventDetail({
          kind: 'update_org_member',
          data: {
            newRole: getOrganizationRole({
              name: 'Admin',
            }),
            oldRole: getOrganizationRole({
              name: 'Member',
            }),
            tenantUserId: '123',
            firstName: 'John',
            lastName: 'Doe',
          },
        })}
        hasPrincipalActor={false}
      />,
    );

    const name = screen.getByText("John Doe's");
    expect(name).toBeInTheDocument();

    const updatedText = screen.getByText('Updated');
    expect(updatedText).toBeInTheDocument();

    const fromText = screen.getByText('role from');
    expect(fromText).toBeInTheDocument();

    const oldRole = screen.getByText('Admin');
    expect(oldRole).toBeInTheDocument();

    const toText = screen.getByText('to');
    expect(toText).toBeInTheDocument();

    const newRole = screen.getByText('Member');
    expect(newRole).toBeInTheDocument();
  });

  it('renders generic member text when name is not provided', () => {
    customRender(
      <UpdateOrgMember
        detail={getAuditEventDetail({
          kind: 'update_org_member',
          data: {
            newRole: getOrganizationRole({}),
            oldRole: getOrganizationRole({}),
            tenantUserId: '123',
            firstName: undefined,
            lastName: undefined,
          },
        })}
        hasPrincipalActor={false}
      />,
    );

    const genericText = screen.getByText("a member's");
    expect(genericText).toBeInTheDocument();
  });
});
