import { customRender, screen, waitFor } from '@onefootprint/test-utils';
import userEvent from '@testing-library/user-event';
import RoleDisplay from './role-display';
import { roleFixture } from './role-display.test.config';

describe('<RoleDisplay />', () => {
  describe('when isNew is true', () => {
    it('should show role text with name', () => {
      customRender(<RoleDisplay isNew role={roleFixture} />);
      const element = screen.getByText('role (Admin)');
      expect(element).toBeInTheDocument();
    });
  });

  describe('when isNew is false', () => {
    it('should show only role name', () => {
      customRender(<RoleDisplay role={roleFixture} />);
      const element = screen.getByText('Admin');
      expect(element).toBeInTheDocument();
    });
  });

  describe('hover behavior', () => {
    it('should show role permissions on hover', async () => {
      customRender(<RoleDisplay role={roleFixture} />);
      const trigger = screen.getByText('Admin');
      await userEvent.hover(trigger);
      // RolePermissions component should be rendered
      await waitFor(() => {
        const rolePermissions = screen.getByText('"Admin" role permissions');
        expect(rolePermissions).toBeInTheDocument();
      });
    });
  });
});
