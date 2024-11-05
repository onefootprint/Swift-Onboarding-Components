import { customRender, screen } from '@onefootprint/test-utils';
import DeactivateOrgRole from './deactivate-org-role';
import { deactivateOrgRoleFixture } from './deactivate-org-role.test.config';

describe('<DeactivateOrgRole />', () => {
  it('should render with principal actor', () => {
    customRender(<DeactivateOrgRole detail={deactivateOrgRoleFixture} hasPrincipalActor={true} />);

    const text = screen.getByText('deleted the');
    expect(text).toBeInTheDocument();
  });

  it('should render without principal actor', () => {
    customRender(<DeactivateOrgRole detail={deactivateOrgRoleFixture} hasPrincipalActor={false} />);

    const text = screen.getByText('Deleted the');
    expect(text).toBeInTheDocument();
  });
});
