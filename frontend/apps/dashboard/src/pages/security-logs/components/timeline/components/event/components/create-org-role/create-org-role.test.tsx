import { getAuditEventDetail } from '@onefootprint/fixtures/dashboard';
import { customRender, screen } from '@onefootprint/test-utils';
import CreateOrgRole from './create-org-role';

describe('<CreateOrgRole />', () => {
  it('should render with principal actor', () => {
    customRender(
      <CreateOrgRole
        detail={getAuditEventDetail({
          kind: 'create_org_role',
        })}
        hasPrincipalActor={true}
      />,
    );

    const text = screen.getByText('created a new');
    expect(text).toBeInTheDocument();
  });

  it('should render without principal actor', () => {
    customRender(
      <CreateOrgRole
        detail={getAuditEventDetail({
          kind: 'create_org_role',
        })}
        hasPrincipalActor={false}
      />,
    );

    const text = screen.getByText('Created a new');
    expect(text).toBeInTheDocument();
  });
});
