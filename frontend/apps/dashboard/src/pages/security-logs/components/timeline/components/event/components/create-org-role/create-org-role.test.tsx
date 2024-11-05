import { customRender, screen } from '@onefootprint/test-utils';
import CreateOrgRole from './create-org-role';
import { createOrgRoleFixture } from './create-org-role.test.config';

describe('<CreateOrgRole />', () => {
  it('should render with principal actor', () => {
    customRender(<CreateOrgRole detail={createOrgRoleFixture} hasPrincipalActor={true} />);

    const text = screen.getByText('created a new');
    expect(text).toBeInTheDocument();
  });

  it('should render without principal actor', () => {
    customRender(<CreateOrgRole detail={createOrgRoleFixture} hasPrincipalActor={false} />);

    const text = screen.getByText('Created a new');
    expect(text).toBeInTheDocument();
  });
});
