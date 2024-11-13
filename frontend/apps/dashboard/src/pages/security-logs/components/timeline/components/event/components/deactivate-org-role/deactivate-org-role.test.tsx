import { getAuditEventDetail } from '@onefootprint/fixtures/dashboard';
import { customRender, screen } from '@onefootprint/test-utils';
import DeactivateOrgRole from './deactivate-org-role';

describe('<DeactivateOrgRole />', () => {
  it('should render with principal actor', () => {
    customRender(
      <DeactivateOrgRole detail={getAuditEventDetail({ kind: 'deactivate_org_role' })} hasPrincipalActor={true} />,
    );

    const text = screen.getByText('deleted the');
    expect(text).toBeInTheDocument();
  });

  it('should render without principal actor', () => {
    customRender(
      <DeactivateOrgRole detail={getAuditEventDetail({ kind: 'deactivate_org_role' })} hasPrincipalActor={false} />,
    );

    const text = screen.getByText('Deleted the');
    expect(text).toBeInTheDocument();
  });
});
