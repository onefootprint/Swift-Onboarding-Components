import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { RoleScopeKind } from '@onefootprint/types';
import { asUserWithScope } from 'src/config/tests';

import PermissionGate from './permission-gate';

describe('<PermissionGate />', () => {
  describe('when the user has permission', () => {
    it('should just render the button', () => {
      asUserWithScope([RoleScopeKind.admin]);
      customRender(
        <PermissionGate scopeKind="api_keys" fallbackText="You don't have permission">
          <button type="button">Create</button>
        </PermissionGate>,
      );
      const button = screen.getByRole('button', { name: 'Create' });
      expect(button).not.toHaveAttribute('disabled');
    });
  });

  describe('when the user does not have permission', () => {
    it('should disable the button and show a tooltip', async () => {
      asUserWithScope([RoleScopeKind.read]);
      customRender(
        <PermissionGate scopeKind="api_keys" fallbackText="You don't have permission">
          <button type="button">Create</button>
        </PermissionGate>,
      );
      const button = screen.getByRole('button', { name: 'Create' });
      expect(button).toHaveAttribute('disabled');

      await userEvent.hover(button);
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip', {
          name: "You don't have permission",
        });
        expect(tooltip).toBeInTheDocument();
      });
    });
  });
});
