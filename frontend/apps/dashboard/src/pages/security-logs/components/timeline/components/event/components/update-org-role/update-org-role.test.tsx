import { customRender, screen } from '@onefootprint/test-utils';
import UpdateOrgRole from './update-org-role';
import { updateOrgRoleFixture } from './update-org-role.test.config';

describe('<UpdateOrgRole />', () => {
  it('should render with principal actor', () => {
    customRender(<UpdateOrgRole detail={updateOrgRoleFixture} hasPrincipalActor={true} />);

    const text = screen.getByText('edited the');
    expect(text).toBeInTheDocument();
  });

  it('should render without principal actor', () => {
    customRender(<UpdateOrgRole detail={updateOrgRoleFixture} hasPrincipalActor={false} />);

    const text = screen.getByText('Edited the');
    expect(text).toBeInTheDocument();
  });
});
