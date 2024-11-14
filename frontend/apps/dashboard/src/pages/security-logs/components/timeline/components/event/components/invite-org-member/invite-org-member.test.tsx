import { getAuditEventDetail } from '@onefootprint/fixtures/dashboard';
import { customRender, screen } from '@onefootprint/test-utils';
import InviteOrgMember from './invite-org-member';

const inviteOrgMemberFixture = getAuditEventDetail({
  kind: 'invite_org_member',
  data: {
    email: 'john@doe.com',
    firstName: 'John',
    lastName: 'Doe',
    tenantName: 'Acme Corp',
    scopes: [],
    tenantRoleId: '123',
    tenantRoleName: 'Admin',
  },
});

describe('<InviteOrgMember />', () => {
  it('renders with principal actor', () => {
    customRender(<InviteOrgMember detail={inviteOrgMemberFixture} hasPrincipalActor={true} />);
    const invitedText = screen.getByText('invited');
    expect(invitedText).toBeInTheDocument();
    const nameText = screen.getByText('John Doe');
    expect(nameText).toBeInTheDocument();
    const toJoinText = screen.getByText('to join');
    expect(toJoinText).toBeInTheDocument();
    const tenantText = screen.getByText('Acme Corp');
    expect(tenantText).toBeInTheDocument();
  });

  it('renders with capitalized text when no principal actor', () => {
    customRender(<InviteOrgMember detail={inviteOrgMemberFixture} hasPrincipalActor={false} />);
    const invitedText = screen.getByText('Invited');
    expect(invitedText).toBeInTheDocument();
  });

  it('renders "a member" when no name provided', () => {
    const noNameFixture = getAuditEventDetail({
      kind: 'invite_org_member',
      data: {
        email: 'member@acme.com',
        tenantName: 'Acme Corp',
        scopes: [],
        tenantRoleId: '123',
        tenantRoleName: 'Admin',
      },
    });

    customRender(<InviteOrgMember detail={noNameFixture} hasPrincipalActor={true} />);
    const memberText = screen.getByText('a member');
    expect(memberText).toBeInTheDocument();
  });
});
